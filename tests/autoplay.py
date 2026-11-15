"""Check real music autoplay under permissive and restrictive browser policies."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import threading
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass
    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (ConnectionResetError, BrokenPipeError):
            pass

def main():
    server = ThreadingHTTPServer(('127.0.0.1', 0), partial(QuietHandler, directory=str(ROOT/'dist')))
    threading.Thread(target=server.serve_forever, daemon=True).start()
    try:
        with sync_playwright() as p:
            for policy in ['user-gesture-required', 'no-user-gesture-required']:
                browser = p.chromium.launch(
                    executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',
                    headless=True, args=[f'--autoplay-policy={policy}'])
                page = browser.new_page(reduced_motion='reduce')
                # The audio behavior is independent of the 3D renderer.
                page.route('**/scene.js', lambda route: route.fulfill(body='', content_type='text/javascript'))
                page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='domcontentloaded')
                controls = page.locator('.music-controls')
                expect(page.locator('#welcome-screen')).to_be_visible()
                assert page.locator('#background-audio').evaluate('e=>e.paused')
                output=ROOT/'qa-output'
                output.mkdir(exist_ok=True)
                page.screenshot(path=str(output/f'welcome-{policy}.png'))
                page.locator('#welcome-screen [data-language="en"]').click()
                expect(page.locator('#enter-world')).to_contain_text('Enter my world')
                assert page.locator('#background-audio').evaluate('e=>e.paused')
                page.locator('#enter-world').click()
                expect(page.locator('#welcome-screen')).not_to_be_visible()
                expect(controls).to_have_attribute('data-music-state', 'playing')
                page.wait_for_function("document.querySelector('#background-audio').currentTime>0")
                expect(page.locator('#background-audio')).not_to_be_visible()
                page.locator('#music-toggle').click()
                expect(controls).to_have_attribute('data-music-state', 'paused')
                page.locator('.destination-nav [data-go="home"]').click()
                assert page.locator('#background-audio').evaluate('e=>e.paused')
                page.keyboard.press('Tab')
                assert page.locator('#background-audio').evaluate('e=>e.paused')
                page.locator('#music-toggle').click()
                expect(controls).to_have_attribute('data-music-state', 'playing')
                browser.close()
                print(f'PASS: {policy}, real playback, hidden player, manual pause respected')
            browser = p.chromium.launch(
                executable_path='C:/Program Files/Google/Chrome/Application/chrome.exe',
                headless=True, args=['--autoplay-policy=user-gesture-required'])
            page = browser.new_page()
            page.route('**/scene.js', lambda route: route.fulfill(body='', content_type='text/javascript'))
            page.goto(f'http://127.0.0.1:{server.server_port}', wait_until='domcontentloaded')
            page.set_viewport_size({'width':390,'height':640})
            expect(page.locator('#welcome-screen')).to_be_visible()
            page.keyboard.press('Escape')
            expect(page.locator('#welcome-screen')).to_be_visible()
            assert page.locator('#background-audio').evaluate('e=>e.paused')
            page.screenshot(path=str(ROOT/'qa-output/welcome-mobile.png'))
            assert page.evaluate('document.documentElement.scrollWidth <= innerWidth')
            page.emulate_media(reduced_motion='no-preference')
            page.locator('#enter-world').focus()
            page.keyboard.press('Enter')
            expect(page.locator('.music-controls')).to_have_attribute('data-music-state', 'playing')
            expect(page.locator('#welcome-screen')).not_to_be_visible()
            browser.close()
            print('PASS: keyboard entry starts music and dismisses welcome screen')
    finally:
        server.shutdown()
        server.server_close()

if __name__ == '__main__':
    main()
