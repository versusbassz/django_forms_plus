import re

from playwright.sync_api import Page, expect


DEV_SITE_ROOT_URL = 'http://localhost:8001'

# see https://github.com/microsoft/playwright-python/issues/2187
# maybe try other variants from the link above
expect.set_options(timeout=1_500)


def tid(name: str) -> str:
    """
    tid is "test_id"
    """
    return f'[data-dfp-test="{name}"]'


def test_homepage(page: Page):
    page.goto(DEV_SITE_ROOT_URL)

    expect(page).to_have_title(re.compile('Homepage'))


def test_old_reset_pwd_form(page: Page):
    response = page.goto(DEV_SITE_ROOT_URL + '/blog_old/reset-pwd/')

    assert response.ok
    expect(page).to_have_title(re.compile('reset', re.IGNORECASE))


def test_dfp_contacts_form(page: Page):
    response = page.goto(DEV_SITE_ROOT_URL + '/blog_react/contacts/')

    assert response.ok
    expect(page).to_have_title(re.compile('contacts', re.IGNORECASE))
    expect(page.locator(f'css=.dfp-form')).to_be_visible()

    expect(page.locator(f'css=.dfp-form {tid("external_html_block")}')).to_be_visible()


def test_dfp_profile_add_form(page: Page):
    response = page.goto(DEV_SITE_ROOT_URL + '/blog_react/profile/add/')

    assert response.ok
    expect(page).to_have_title(re.compile('add', re.IGNORECASE))
    expect(page.locator(f'css=.dfp-form')).to_be_visible()
