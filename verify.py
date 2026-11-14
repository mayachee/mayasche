"""Local browser checks for the portfolio; creates no remote content."""
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
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT / 'dist')))
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    origin = f'http://127.0.0.1:{server.server_port}'
    errors = []
    try:
        with sync_playwright() as playwright:
            browser = playwright.chromium.launch(executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',
                headless=True, args=['--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
            page = browser.new_page(viewport={'width': 1440, 'height': 1050}, reduced_motion='reduce')
            page.on('pageerror', lambda error: errors.append(str(error)))
            page.goto(origin, wait_until='networkidle')
            page.locator('#workspace[data-ready="true"]').wait_for(timeout=30000)
            assert page.locator('#pause-scene').get_attribute('aria-pressed') == 'true'
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.screenshot(path=str(output / 'desktop-hero.png'))
            bounds = page.locator('#workspace').bounding_box()
            for x, y in [(.48, .35), (.46, .37), (.49, .39)]:
                page.locator('#workspace').click(position={'x': bounds['width'] * x, 'y': bounds['height'] * y})
                if page.locator('#project-dialog').is_visible():
                    break
            assert page.locator('#project-dialog').is_visible(), '3D monitor selection did not open a case study'
            assert page.locator('#case-content h2').inner_text() == 'Scripts Studio'
            page.locator('.dialog-close').click()
            before = page.locator('#workspace').screenshot()
            page.locator('#rotate-right').click()
            after = page.locator('#workspace').screenshot()
            assert before != after, '3D rotation did not change the render'
            page.locator('#reset-scene').click()
            page.get_by_role('button', name='Open AIRBCAR case study', exact=True).click()
            assert page.locator('#project-dialog').is_visible()
            assert page.locator('#case-content h2').inner_text() == 'AIRBCAR'
            page.screenshot(path=str(output / 'case-study.png'))
            page.keyboard.press('Escape')
            assert not page.locator('#project-dialog').is_visible()
            page.get_by_role('button', name='View the lab plan', exact=False).click()
            assert 'has not yet been implemented' in page.locator('#case-content').inner_text()
            page.locator('.dialog-close').click()
            page.get_by_role('button', name='Open Scripts Studio case study', exact=True).click()
            assert page.locator('#case-content img').evaluate('(img)=>img.complete && img.naturalWidth>0')
            page.locator('.dialog-close').click()
            assert not page.locator('a[href="#"]').count()
            page.locator('.wordmark').first.click()
            page.screenshot(path=str(output / 'desktop-full.png'), full_page=True)
            for width in [1024, 390]:
                page.set_viewport_size({'width': width, 'height': 900})
                page.locator('.wordmark').first.click()
                page.locator('#workspace').scroll_into_view_if_needed()
                expect(page.locator('#workspace')).to_have_attribute('data-render-width', str(round(page.locator('#workspace').bounding_box()['width'])))
                page.locator('.wordmark').first.click()
                assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
                page.screenshot(path=str(output / f'hero-{width}.png'))
            page.locator('.menu-toggle').click()
            assert page.locator('.site-header nav').is_visible()
            page.locator('.site-header nav a[href="#about"]').click()
            assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'false'
            fallback = browser.new_page(viewport={'width': 1440, 'height': 950}, reduced_motion='reduce')
            fallback.add_init_script("const original=HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext=function(type,...args){return type.startsWith('webgl')?null:original.call(this,type,...args);};")
            fallback.goto(origin, wait_until='networkidle')
            assert not fallback.locator('.hero-visual').evaluate('(el)=>el.classList.contains("scene-ready")')
            assert 'without live 3D' in fallback.locator('#scene-status').inner_text()
            fallback.screenshot(path=str(output / 'fallback.png'))
            browser.close()
        assert not errors, errors
        result = dict(status='passed', checks=['real WebGL scene', 'rotation controls', 'reduced motion',
            'project case studies', 'honest planned-lab content', 'local project screenshot',
            'mobile menu', 'desktop/tablet/mobile overflow', 'WebGL-unavailable fallback', 'no JS errors'],
            screenshots=str(output))
        (output / 'result.json').write_text(json.dumps(result, indent=2), encoding='utf-8')
        print(json.dumps(result, indent=2))
    finally:
        server.shutdown()
        server.server_close()
        worker.join(5)


if __name__ == '__main__':
    main()
