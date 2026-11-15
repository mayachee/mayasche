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
                if policy == 'user-gesture-required':
                    expect(controls).to_have_attribute('data-music-state', 'blocked')
                    page.locator('.destination-nav [data-go="work"]').click()
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
            expect(page.locator('.music-controls')).to_have_attribute('data-music-state', 'blocked')
            page.keyboard.press('Tab')
            expect(page.locator('.music-controls')).to_have_attribute('data-music-state', 'playing')
            browser.close()
            print('PASS: keyboard interaction starts music without using music controls')
    finally:
        server.shutdown()
        server.server_close()

if __name__ == '__main__':
    main()
