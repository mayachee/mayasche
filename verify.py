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
            page.on('pageerror', lambda e: errors.append(e.stack))
            page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='networkidle')
            page.locator('#enter-world').click()
            canvas = page.locator('#workspace')
            expect(canvas).to_have_attribute('data-ready','true',timeout=30000)
            assert canvas.bounding_box()['width'] == 1440
            assert page.locator('html').get_attribute('lang') == 'de'
            assert 'IT-Systemintegration' in page.title()
            assert 'Deutsch B2' in page.locator('.profile-badge').inner_text()
            assert page.locator('#pause-scene').get_attribute('aria-pressed') == 'true'
            # Use the real supplied MP3, including decoding and actual playback.
            audio=page.locator('#background-audio')
            expect(audio).not_to_be_visible()
            assert audio.get_attribute('loop') is not None
            assert page.locator('iframe').count()==0
            page.wait_for_function("document.querySelector('#background-audio').readyState>=1")
            assert page.evaluate("document.querySelector('#background-audio').duration")>0
            if not audio.evaluate('e=>e.paused'):
                page.locator('#music-toggle').click()
            page.locator('#music-toggle').click()
            expect(page.locator('.music-controls')).to_have_attribute('data-music-state','playing')
            page.wait_for_function("document.querySelector('#background-audio').currentTime>0")
            page.locator('#music-volume').focus()
            page.keyboard.press('Home')
            assert audio.evaluate('e=>e.volume')==0
            page.keyboard.press('End')
            assert audio.evaluate('e=>e.volume')==1
            page.locator('#music-toggle').click()
            expect(page.locator('.music-controls')).to_have_attribute('data-music-state','paused')
            assert audio.evaluate('e=>e.paused')
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
            for project in ['born2beroot','inception','netpractice','transcendence','irc','airbcar','studio']:
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
                    if page.locator('#object-label').inner_text() in ['Born2beroot öffnen','Inception öffnen']:
                        page.mouse.click(x,y)
                        expect(page.locator('#project-dialog')).to_be_visible()
                        page.keyboard.press('Escape')
                        selected=True
                        break
                if selected: break
            assert selected, '3D project objects could not be selected'
            page.locator('.destination-nav [data-go="systems"]').click()
            assert 'Lernziele' in page.locator('.story-panel[data-view="systems"]').inner_text()
            page.locator('[data-project="lab"]').click()
            assert 'noch nicht umgesetzt' in page.locator('#case-content').inner_text()
            assert page.locator('#case-content svg').count() == 1
            assert 'Active Directory' in page.locator('#case-content').inner_text()
            page.keyboard.press('Escape')
            page.locator('#read-mode').click()
            assert page.locator('.story-panel[data-view]:visible').count()==5
            page.locator('#read-mode').click()
            # Language changes preserve the station, translate cases and persist after reload.
            home=page.locator('.story-panel[data-view="home"]')
            assert home.locator('.start-links a[href="https://github.com/mayachee"]').count()==1
            assert home.locator('a[href$="CV_MYassine_Ayache_EN.pdf"]').count()==1
            assert home.locator('a[href$="Lebenslauf_MYassine_Ayache.pdf"]').count()==1
            page.locator('header [data-language="en"]').click()
            expect(page.locator('html')).to_have_attribute('lang','en')
            expect(page.locator('header [data-language="en"]')).to_have_attribute('aria-pressed','true')
            expect(page.locator('.story-panel[data-view="systems"]')).to_be_visible()
            assert 'learning goals' in page.locator('.story-panel[data-view="systems"]').inner_text()
            page.locator('[data-project="lab"]').click()
            assert 'not yet been implemented' in page.locator('#case-content').inner_text()
            assert 'Planned lab' in page.locator('#case-content figcaption').inner_text()
            page.keyboard.press('Escape')
            page.locator('.destination-nav [data-go="work"]').click()
            for project in ['born2beroot','inception','netpractice','transcendence','irc','airbcar','studio']:
                page.locator(f'[data-project="{project}"]').click()
                expect(page.locator('#project-dialog')).to_be_visible()
                assert 'Relevanz' not in page.locator('#case-content').inner_text()
                assert 'system integration' in page.locator('#case-content').inner_text().lower()
                page.keyboard.press('Escape')
            page.reload(wait_until='networkidle')
            page.locator('#enter-world').click()
            canvas=page.locator('#workspace')
            expect(canvas).to_have_attribute('data-ready','true',timeout=30000)
            expect(page.locator('html')).to_have_attribute('lang','en')
            page.locator('.destination-nav [data-go="home"]').click()
            assert 'Networks' in page.locator('#home-title').inner_text()
            if not page.locator('#background-audio').evaluate('e=>e.paused'):
                page.locator('#music-toggle').click()
            expect(page.locator('#music-toggle')).to_have_attribute('aria-label','Play music')
            assert page.locator('#music-volume').input_value()=='100'
            page.locator('#music-volume').evaluate("e=>{e.value='25';e.dispatchEvent(new Event('input',{bubbles:true}))}")
            page.screenshot(path=str(output/'english-home.png'))
            page.set_viewport_size({'width':390,'height':844})
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            for selector in ['.brand','header [data-language="en"]','header [data-language="de"]','#read-mode']:
                b=page.locator(selector).bounding_box()
                assert b['x']>=0 and b['x']+b['width']<=390,selector
            page.screenshot(path=str(output/'english-mobile.png'))
            page.locator('header [data-language="de"]').click()
            expect(page.locator('html')).to_have_attribute('lang','de')
            assert 'Netzwerke' in page.locator('#home-title').inner_text()
            page.reload(wait_until='networkidle')
            page.locator('#enter-world').click()
            expect(page.locator('html')).to_have_attribute('lang','de')
            canvas=page.locator('#workspace')
            expect(canvas).to_have_attribute('data-ready','true',timeout=30000)
            page.set_viewport_size({'width':1440,'height':1000})
            # Motion-enabled travel must progress over frames instead of teleporting.
            # A delayed event can make a queued RAF timestamp older than the scheduling time.
            page.evaluate("() => {const raf=window.requestAnimationFrame;let oldFrame=true;window.requestAnimationFrame=cb=>raf.call(window,t=>{const time=oldFrame?t-1000:t;oldFrame=false;cb(time)});}")
            page.emulate_media(reduced_motion='no-preference')
            page.locator('.destination-nav [data-go="contact"]').click()
            first=canvas.get_attribute('data-camera')
            page.wait_for_timeout(300)
            expect(canvas).not_to_have_attribute('data-camera', first, timeout=5000)
            page.emulate_media(reduced_motion='reduce')
            for width,height in [(1024,900),(390,844),(390,640)]:
                page.set_viewport_size({'width':width,'height':height})
                expect(canvas).to_have_attribute('data-render-width',str(width))
                page.locator('.destination-nav [data-go="home"]').click()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                page.screenshot(path=str(output/f'immersive-{width}-{height}.png'))
                page.locator('.destination-nav [data-go="contact"]').click()
                expect(page.locator('.story-panel[data-view="contact"] .primary')).to_be_visible()
                portrait=page.locator('.contact-portrait')
                expect(portrait).to_be_visible()
                assert portrait.evaluate('e=>e.complete && e.naturalWidth>0')
                page.screenshot(path=str(output/f'contact-{width}-{height}.png'))
            fallback=browser.new_page(viewport={'width':390,'height':844})
            fallback.add_init_script("const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(t,...a){return t.startsWith('webgl')?null:get.call(this,t,...a)}")
            fallback.goto(f'http://127.0.0.1:{server.server_port}',wait_until='networkidle')
            fallback.locator('#enter-world').click()
            expect(fallback.locator('#world-fallback')).to_be_visible()
            fallback.locator('.destination-nav [data-go="work"]').click()
            fallback.locator('[data-project="studio"]').click()
            expect(fallback.locator('#project-dialog')).to_be_visible()
            browser.close()
        assert not errors, errors
        result={'status':'passed','checks':['fullscreen real WebGL world','five distinct camera destinations','animated camera travel','3D object selection','orbit controls','project dialogs','reading view','reduced motion','tablet and mobile layouts','WebGL fallback','English/German content and case studies','language persistence','Start CV and GitHub links','real MP3 decoding and playback','hidden audio and play/pause/volume controls','contact portrait at desktop and mobile sizes','no JavaScript errors']}
        (output/'result.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
        print(json.dumps(result,indent=2))
    finally:
        server.shutdown()
        server.server_close()

if __name__=='__main__': main()
