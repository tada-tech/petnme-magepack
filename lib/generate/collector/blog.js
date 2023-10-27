/* global BASE_URL */

const merge = require('lodash.merge');

const logger = require('../../utils/logger');
const authenticate = require('../authenticate');
const blockMagepack = require('../blockMagepack');
const collectModules = require('../collectModules');

const baseConfig = {
    url: [],
    name: 'blog',
    modules: {},
};

/**
 * Prepares a bundle configuration for all modules loaded on blog pages.
 *
 * @param {BrowserContext} browserContext Puppeteer's BrowserContext object.
 * @param {object} configuration Generation configuration object.
 * @param {string} configuration.blogUrl URL to the blog page.
 * @param {string} configuration.authUsername Basic auth username.
 * @param {string} configuration.authPassword Basic auth password.
 */
const blog = async (
    browserContext,
    { blogUrl, authUsername, authPassword }
) => {
    const bundleConfig = merge({}, baseConfig);

    const bundleName = bundleConfig.name;

    logger.info(`Collecting modules for bundle "${bundleName}".`);

    const page = await browserContext.newPage();

    blockMagepack(page);

    await authenticate(page, authUsername, authPassword);

    // open blog detail page
    await page.goto(blogUrl, { waitUntil: 'networkidle0' });
    const blogModules = await collectModules(page);

    // open blog list page
    const baseUrl = await page.evaluate(() => BASE_URL);
    await page.goto(`${baseUrl}blog`);
    merge(bundleConfig.modules, blogModules, await collectModules(page));

    await page.close();

    logger.success(`Finished collecting modules for bundle "${bundleName}".`);

    return bundleConfig;
};

module.exports = blog;
