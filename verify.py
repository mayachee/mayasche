"""Browser checks for the immersive portfolio; only local content is served."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import json
from pathlib import Path
import threading

ROOT = Path(__file__).resolve().parent

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

def main():
    from playwright.sync_api import sync_playwright, expect
    output = ROOT / 'qa-output'
    output.mkdir(exist_ok=True)
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT/'dist')))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    errors = []
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe', headless=True,
                args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
            page = browser.new_page(viewport={'width':1440,'height':1000}, reduced_motion='reduce')
            page.on('pageerror', lambda e: errors.append(str(e)))
            page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
            canvas = page.locator('#workspace')
            expect(canvas).to_have_attribute('data-ready','true')
            assert canvas.bounding_box()['width'] == 1440
            assert page.locator('#pause-scene').get_attribute('aria-pressed') == 'true'
            page.screenshot(path=str(output/'immersive-home.png'))
            cameras = set()
            for view in ['work','systems','about','contact','home']:
                page.locator(f'.destination-nav [data-go="{view}"]').click()
                expect(canvas).to_have_attribute('data-destination',view)
                expect(page.locator(f'.story-panel[data-view="{view}"]')).to_be_visible()
                expect(page.locator(f'.destination-nav [data-go="{view}"]')).to_have_attribute('aria-current','page')
                expect(canvas).to_have_attribute('data-camera',__import__('re').compile(r'.+'))
                page.wait_for_timeout(150)
                cameras.add(canvas.get_attribute('data-camera'))
                assert not page.evaluate('document.documentElement.scrollWidth > innerWidth')
                if view in ['work','systems']:
                    page.screenshot(path=str(output/f'immersive-{view}.png'))
            assert len(cameras)==5, 'Destinations did not move the camera'
            before = canvas.screenshot()
            page.locator('#rotate-right').click()
            page.wait_for_timeout(300)
            assert before != canvas.screenshot(), 'Orbit control did not change the scene'
            page.locator('.destination-nav [data-go="work"]').click()
            for project in ['airbcar','studio']:
                page.locator(f'[data-project="{project}"]').click()
                expect(page.locator('#project-dialog')).to_be_visible()
                if project=='studio':
                    page.wait_for_function("document.querySelector('#case-content img')?.naturalWidth > 0")
                page.keyboard.press('Escape')
                expect(page.locator('#project-dialog')).not_to_be_visible()
            # Verify actual geometry is selectable, using its hover label rather than fixed model coordinates.
            selected = False
            for y in range(260,650,65):
                for x in range(700,1300,65):
                    page.mouse.move(x,y)
                    if page.locator('#object-label').inner_text() in ['Open Scripts Studio','Open AIRBCAR']:
                        page.mouse.click(x,y)
                        expect(page.locator('#project-dialog')).to_be_visible()
                        page.keyboard.press('Escape')
                        selected=True
                        break
                if selected: break
            assert selected, '3D project objects could not be selected'
            page.locator('.destination-nav [data-go="systems"]').click()
            page.locator('[data-project="lab"]').click()
            assert 'has not yet been implemented' in page.locator('#case-content').inner_text()
            page.keyboard.press('Escape')
            page.locator('#read-mode').click()
            assert page.locator('.story-panel[data-view]:visible').count()==5
            page.locator('#read-mode').click()
            # Motion-enabled travel must progress over frames instead of teleporting.
            page.emulate_media(reduced_motion='no-preference')
            page.locator('.destination-nav [data-go="contact"]').click()
            first=canvas.get_attribute('data-camera')
            page.wait_for_timeout(300)
            assert first != canvas.get_attribute('data-camera')
            page.emulate_media(reduced_motion='reduce')
            for width,height in [(1024,900),(390,844),(390,640)]:
                page.set_viewport_size({'width':width,'height':height})
                expect(canvas).to_have_attribute('data-render-width',str(width))
                page.locator('.destination-nav [data-go="home"]').click()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                page.screenshot(path=str(output/f'immersive-{width}-{height}.png'))
                page.locator('.destination-nav [data-go="contact"]').click()
                expect(page.locator('.story-panel[data-view="contact"] .primary')).to_be_visible()
            fallback=browser.new_page(viewport={'width':390,'height':844})
            fallback.add_init_script("const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.startsWith('webgl')?null:get.call(this,t,...a)}")
            fallback.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
            expect(fallback.locator('#world-fallback')).to_be_visible()
            fallback.locator('.destination-nav [data-go="work"]').click()
            fallback.locator('[data-project="studio"]').click()
            expect(fallback.locator('#project-dialog')).to_be_visible()
            browser.close()
        assert not errors, errors
        result={'status':'passed','checks':['fullscreen real WebGL world','five distinct camera destinations','animated camera travel','3D object selection','orbit controls','project dialogs','reading view','reduced motion','tablet and mobile layouts','WebGL fallback','no JavaScript errors']}
        (output/'result.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
        print(json.dumps(result,indent=2))
    finally:
        server.shutdown()
        server.server_close()

if __name__=='__main__': main()
