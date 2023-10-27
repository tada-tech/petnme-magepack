/* global BASE_URL */

const merge = require('lodash.merge');

const logger = require('../../utils/logger');
const authenticate = require('../authenticate');
const blockMagepack = require('../blockMagepack');
const collectModules = require('../collectModules');

const baseConfig = {
    url: [],
    name: 'brand',
    modules: {},
};

/**
 * Prepares a bundle configuration for all modules loaded on brand pages.
 *
 * @param {BrowserContext} browserContext Puppeteer's BrowserContext object.
 * @param {object} configuration Generation configuration object.
 * @param {string} configuration.brandUrl URL to the brand page.
 * @param {string} configuration.authUsername Basic auth username.
 * @param {string} configuration.authPassword Basic auth password.
 */
const brand = async (
    browserContext,
    { brandUrl, authUsername, authPassword }
) => {
    const bundleConfig = merge({}, baseConfig);

    const bundleName = bundleConfig.name;

    logger.info(`Collecting modules for bundle "${bundleName}".`);

    const page = await browserContext.newPage();

    blockMagepack(page);

    await authenticate(page, authUsername, authPassword);

    // open brand detail page
    await page.goto(brandUrl, { waitUntil: 'networkidle0' });
    const brandModules = await collectModules(page);

    // open brand list page
    const baseUrl = await page.evaluate(() => BASE_URL);
    await page.goto(`${baseUrl}shop-by-brand`);

    merge(bundleConfig.modules, brandModules, await collectModules(page));

    await page.close();

    logger.success(`Finished collecting modules for bundle "${bundleName}".`);

    return bundleConfig;
};

module.exports = brand;
