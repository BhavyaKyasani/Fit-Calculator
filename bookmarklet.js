/**
 * Perfect Fit - Advanced Bookmarklet for Extracting Garment Measurements
 * Drag this to your bookmarks bar and click on product pages
 */

(function() {
    'use strict';

    // Measurement normalization patterns
    const MEASUREMENT_PATTERNS = {
        chest: /(chest|bust|circumference)[^\d]*(\d+(?:\.?\d+)?)\s*(inch|in|"|cm|centimeter|centimetre)/gi,
        waist: /waist[^\d]*(\d+(?:\.?\d+)?)\s*(inch|in|"|cm|centimeter|centimetre)/gi,
        hip: /hip[^\d]*(\d+(?:\.?\d+)?)\s*(inch|in|"|cm|centimeter|centimetre)/gi,
        shoulder: /shoulder[^\d]*(\d+(?:\.?\d+)?)\s*(inch|in|"|cm|centimeter|centimetre)/gi,
        inseam: /(inseam|inside leg|inner leg length)[^\d]*(\d+(?:\.?\d+)?)\s*(inch|in|"|cm|centimeter|centimetre)/gi,
        sleeve: /(sleeve|sleeve length)[^\d]*(\d+(?:\.?\d+)?)\s*(inch|in|"|cm|centimeter|centimetre)/gi,
        length: /(length|body length)[^\d]*(\d+(?:\.?\d+)?)\s*(inch|in|"|cm|centimeter|centimetre)/gi,
        size: /size[^\d]*(\d+(?:\.?\d+)?)/gi
    };

    // Unit conversion
    const UNIT_CONVERSIONS = {
        'cm': 1,
        'centimeter': 1,
        'centimetre': 1,
        'inch': 2.54,
        'in': 2.54,
        '"': 2.54
    };

    // Detect which e-commerce site we're on
    const hostname = window.location.hostname.toLowerCase();
    let extractor = null;

    if (hostname.includes('amazon')) {
        extractor = new AmazonExtractor();
    } else if (hostname.includes('myntra')) {
        extractor = new MyntraExtractor();
    } else if (hostname.includes('asos') || hostname.includes('asos.com')) {
        extractor = new AsosExtractor();
    } else {
        showError('This site is not yet supported. Supported: Amazon, Myntra, ASOS. Please add measurements manually.');
        return;
    }

    // Extract measurements
    try {
        const measurements = extractor.extract();
        if (measurements && Object.keys(measurements).length > 3) { // Has more than just source, title, type
            sendToPerfectFit(measurements);
        } else {
            showError('Could not find sufficient measurement information on this page. Try a different product or enter measurements manually.');
        }
    } catch (error) {
        console.error('Extraction error:', error);
        showError('Error extracting measurements: ' + error.message);
    }

    /**
     * Amazon Measurement Extractor - Comprehensive
     */
    function AmazonExtractor() {
        this.extract = function() {
            const measurements = {
                source: 'Amazon',
                productTitle: this.getProductTitle(),
                type: this.detectGarmentType(),
                url: window.location.href
            };

            // Multiple extraction strategies
            const measurementsFound = {};

            // Strategy 1: Size chart tables
            Object.assign(measurementsFound, this.extractFromSizeCharts());

            // Strategy 2: Product details sections
            Object.assign(measurementsFound, this.extractFromProductDetails());

            // Strategy 3: Bullet points and specs
            Object.assign(measurementsFound, this.extractFromBulletPoints());

            // Strategy 4: Product description
            Object.assign(measurementsFound, this.extractFromDescription());

            // Normalize all measurements to inches
            const normalized = this.normalizeMeasurements(measurementsFound);

            return { ...measurements, ...normalized };
        };

        this.getProductTitle = function() {
            const selectors = ['#productTitle', '#title', '.a-size-large h1', 'h1'];
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    return element.textContent.trim();
                }
            }
            return 'Unknown Product';
        };

        this.detectGarmentType = function() {
            const title = this.getProductTitle().toLowerCase();
            const breadcrumb = document.querySelector('#wayfinding-breadcrumbs_feature_div, .a-breadcrumb')?.textContent.toLowerCase() || '';
            const category = document.querySelector('#nav-subnav, #nav-browse')?.textContent.toLowerCase() || '';

            const combined = (title + ' ' + breadcrumb + ' ' + category).toLowerCase();

            if (combined.includes('dress') && !combined.includes('sock')) {
                return 'dress';
            } else if (combined.includes('shirt') || combined.includes('t-shirt') || combined.includes('top') ||
                      combined.includes('blouse') || combined.includes('polo')) {
                return 'shirt';
            } else if (combined.includes('pant') || combined.includes('jeans') || combined.includes('trouser') ||
                      combined.includes('short') || combined.includes('legging')) {
                return 'pants';
            } else if (combined.includes('shoe') || combined.includes('sneaker') || combined.includes('boot') ||
                      combined.includes('sandal') || combined.includes('heel')) {
                return 'shoes';
            }
            return 'unknown';
        };

        this.extractFromSizeCharts = function() {
            const measurements = {};

            // Look for size guide/chart buttons and try to open them
            const sizeButtons = document.querySelectorAll('[data-action*="size-chart"], [data-csa-c-action-name*="size"], [class*="size-chart"]');
            if (sizeButtons.length > 0) {
                // Try to click the first size chart button
                try { sizeButtons[0].click(); } catch(e) {}
                // Wait a bit for modal to load
                // Note: This is a limitation of bookmarklets - async operations are tricky
            }

            // Look for tables with measurement data
            const tables = document.querySelectorAll('table');
            for (const table of tables) {
                const tableText = table.textContent.toLowerCase();
                if (tableText.includes('size') && (tableText.includes('inch') || tableText.includes('cm') ||
                    tableText.includes('measurement') || tableText.includes('chest') || tableText.includes('waist'))) {

                    const rows = table.querySelectorAll('tr');
                    for (const row of rows) {
                        const cells = Array.from(row.querySelectorAll('td, th')).map(c => c.textContent.trim().toLowerCase());

                        // Try to extract various measurements
                        const rowText = cells.join(' ').toLowerCase();

                        for (const [key, pattern] of Object.entries(MEASUREMENT_PATTERNS)) {
                            const match = rowText.match(pattern);
                            if (match) {
                                const value = parseFloat(match[1]);
                                const unit = match[2] || 'inch';
                                if (value && !measurements[key]) {
                                    measurements[key] = { value, unit, raw: match[0] };
                                }
                            }
                        }
                    }
                }
            }

            return measurements;
        };

        this.extractFromProductDetails = function() {
            const measurements = {};

            // Product details sections
            const detailSelectors = [
                '#productDetails_detailBullets_sections1',
                '#detailBullets_feature_div',
                '#productDetails_techSpec_section_1',
                '[class*="detail-bullets"]',
                '[class*="product-details"]'
            ];

            for (const selector of detailSelectors) {
                const section = document.querySelector(selector);
                if (section) {
                    const text = section.textContent;
                    Object.assign(measurements, this.parseMeasurementText(text));
                }
            }

            return measurements;
        };

        this.extractFromBulletPoints = function() {
            const measurements = {};

            // Bullet points and lists
            const bullets = document.querySelectorAll('li, .a-list-item, [class*="bullet"]');
            let combinedText = '';

            bullets.forEach(bullet => {
                combinedText += bullet.textContent + ' ';
            });

            return this.parseMeasurementText(combinedText);
        };

        this.extractFromDescription = function() {
            const measurements = {};

            const descSelectors = [
                '#productDescription',
                '[class*="product-description"]',
                '#feature-bullets',
                '.a-spacing-small'
            ];

            for (const selector of descSelectors) {
                const section = document.querySelector(selector);
                if (section) {
                    const text = section.textContent;
                    Object.assign(measurements, this.parseMeasurementText(text));
                }
            }

            return measurements;
        };

        this.parseMeasurementText = function(text) {
            const measurements = {};

            if (!text) return measurements;

            const lowerText = text.toLowerCase();

            for (const [key, pattern] of Object.entries(MEASUREMENT_PATTERNS)) {
                const matches = [...lowerText.matchAll(pattern)];
                if (matches.length > 0) {
                    // Use the first match for consistency
                    const match = matches[0];
                    const value = parseFloat(match[1] || match[2]);
                    const unit = match[2] || (match[3] ? match[3].toLowerCase() : 'inch');

                    if (value && value > 0 && !measurements[key]) {
                        measurements[key] = { value, unit, raw: match[0] };
                    }
                }
            }

            return measurements;
        };

        this.normalizeMeasurements = function(measurements) {
            const normalized = {};

            for (const [key, data] of Object.entries(measurements)) {
                if (data && typeof data.value === 'number') {
                    // Convert to inches
                    let inches = data.value;
                    if (data.unit && UNIT_CONVERSIONS[data.unit.toLowerCase()]) {
                        inches = data.value * UNIT_CONVERSIONS[data.unit.toLowerCase()] / 2.54;
                    }
                    normalized[key] = Math.round(inches * 2) / 2; // Round to nearest 0.5 inch
                }
            }

            return normalized;
        };
    }

    /**
     * Myntra Measurement Extractor - Advanced
     */
    function MyntraExtractor() {
        this.extract = function() {
            const measurements = {
                source: 'Myntra',
                productTitle: this.getProductTitle(),
                type: this.detectGarmentType(),
                url: window.location.href
            };

            // Multiple extraction strategies
            const measurementsFound = {};

            // Strategy 1: Trigger size chart modal/guidance
            this.triggerSizeChartModal();

            // Strategy 2: Parse size chart tables/grids
            Object.assign(measurementsFound, this.extractFromSizeCharts());

            // Strategy 3: Parse specifications sections
            Object.assign(measurementsFound, this.extractFromSpecs());

            // Strategy 4: Parse product description
            Object.assign(measurementsFound, this.extractFromDescription());

            // Normalize measurements to inches
            const normalized = this.normalizeMeasurements(measurementsFound);

            return { ...measurements, ...normalized };
        };

        this.getProductTitle = function() {
            const selectors = ['.pdp-title', 'h1.pdp-name', '[class*="product-name"]', '[class*="pdp-"] h1'];
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    return element.textContent.trim();
                }
            }
            return 'Unknown Product';
        };

        this.detectGarmentType = function() {
            const title = this.getProductTitle().toLowerCase();
            const categoryElements = [
                ...document.querySelectorAll('.breadcrumbs, [class*="breadcrumb"], [class*="category"]'),
                ...document.querySelectorAll('[class*="pdp"] [class*="category"], [class*="product-meta"]')
            ];

            let breadcrumb = '';
            categoryElements.forEach(el => {
                if (el.textContent) breadcrumb += el.textContent.toLowerCase() + ' ';
            });

            const combined = (title + ' ' + breadcrumb).toLowerCase();

            if (combined.includes('dress') && !combined.includes('sock')) {
                return 'dress';
            } else if (combined.includes('shirt') || combined.includes('top') || combined.includes('t-shirt') ||
                      combined.includes('blouse') || combined.includes('kurti') || combined.includes('kurta')) {
                return 'shirt';
            } else if (combined.includes('pant') || combined.includes('jeans') || combined.includes('trouser') ||
                      combined.includes('short') || combined.includes('legging') || combined.includes('jogger') ||
                      combined.includes('cargo') || combined.includes('chinos')) {
                return 'pants';
            } else if (combined.includes('shoe') || combined.includes('sneaker') || combined.includes('boot') ||
                      combined.includes('sandal') || combined.includes('heel') || combined.includes('loafer')) {
                return 'shoes';
            }
            return 'unknown';
        };

        this.triggerSizeChartModal = function() {
            // Look for and try to click size chart/guide buttons
            const sizeSelectors = [
                '[class*="sizeChart"] button',
                '[class*="size-chart"] button',
                '[class*="sizeGuide"] button',
                '[data-modal*="size"]',
                'button[class*="size"]'
            ];

            for (const selector of sizeSelectors) {
                const buttons = document.querySelectorAll(selector);
                if (buttons.length > 0) {
                    try {
                        buttons[0].click();
                        // Small delay for modal to appear
                        break;
                    } catch(e) {
                        console.log('Could not click size chart button:', e);
                    }
                }
            }
        };

        this.extractFromSizeCharts = function() {
            const measurements = {};

            // Look for measurement tables or grids
            const tableSelectors = [
                'table',
                '[class*="sizeChart"] table',
                '[class*="measurement"] table',
                '[class*="size-"] table',
                '[class*="chart"] table'
            ];

            for (const tableSelector of tableSelectors) {
                const tables = document.querySelectorAll(tableSelector);
                for (const table of tables) {
                    const tableText = table.textContent.toLowerCase();
                    if (tableText.includes('size') && (tableText.includes('inch') || tableText.includes('cm') ||
                        tableText.includes('chest') || tableText.includes('waist') || tableText.includes('measurement'))) {

                        const rows = table.querySelectorAll('tr, [class*="row"]');
                        for (const row of rows) {
                            const cells = Array.from(row.querySelectorAll('td, th, [class*="cell"], div')).map(c => c.textContent.trim().toLowerCase());
                            const rowText = cells.join(' ');

                            // Extract measurements using patterns
                            for (const [key, pattern] of Object.entries(MEASUREMENT_PATTERNS)) {
                                const matches = [...rowText.matchAll(pattern)];
                                if (matches.length > 0) {
                                    const match = matches[0];
                                    const value = parseFloat(match[1] || match[2]);
                                    const unit = match[2] || match[3] || 'inch';

                                    if (value && value > 0 && !measurements[key]) {
                                        measurements[key] = { value, unit, raw: match[0] };
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return measurements;
        };

        this.extractFromSpecs = function() {
            const measurements = {};

            // Specifications and fit details sections
            const specSelectors = [
                '.index-row',
                '.pdp-sizeFitDesc',
                '[class*="indexRow"]',
                '[class*="spec"]',
                '[class*="measurement"]',
                '[class*="pdp-size"]'
            ];

            for (const selector of specSelectors) {
                const specs = document.querySelectorAll(selector);
                let combinedText = '';

                specs.forEach(spec => {
                    combinedText += spec.textContent + ' ';
                });

                if (combinedText.includes('size') || combinedText.includes('fit') ||
                    combinedText.includes('measurement') || combinedText.includes('chest') ||
                    combinedText.includes('waist') || combinedText.includes('length')) {

                    Object.assign(measurements, this.parseMeasurementText(combinedText));
                }
            }

            return measurements;
        };

        this.extractFromDescription = function() {
            const measurements = {};

            // Product description sections
            const descSelectors = [
                '[class*="description"]',
                '[class*="details"]',
                '[class*="info"]',
                '.pdp-product-description',
                '[class*="pdp"] [class*="description"]'
            ];

            for (const selector of descSelectors) {
                const sections = document.querySelectorAll(selector);
                sections.forEach(section => {
                    const text = section.textContent;
                    Object.assign(measurements, this.parseMeasurementText(text));
                });
            }

            return measurements;
        };

        this.parseMeasurementText = function(text) {
            const measurements = {};

            if (!text) return measurements;

            const lowerText = text.toLowerCase();

            for (const [key, pattern] of Object.entries(MEASUREMENT_PATTERNS)) {
                const matches = [...lowerText.matchAll(pattern)];
                if (matches.length > 0) {
                    const match = matches[0];
                    const value = parseFloat(match[1] || match[2]);
                    const unit = match[2] || (match[3] ? match[3].toLowerCase() : 'inch');

                    if (value && value > 0 && !measurements[key]) {
                        measurements[key] = { value, unit, raw: match[0] };
                    }
                }
            }

            return measurements;
        };

        this.normalizeMeasurements = function(measurements) {
            const normalized = {};

            for (const [key, data] of Object.entries(measurements)) {
                if (data && typeof data.value === 'number') {
                    // Convert to inches
                    let inches = data.value;
                    if (data.unit && UNIT_CONVERSIONS[data.unit.toLowerCase()]) {
                        inches = data.value * UNIT_CONVERSIONS[data.unit.toLowerCase()] / 2.54;
                    }
                    normalized[key] = Math.round(inches * 2) / 2; // Round to nearest 0.5 inch
                }
            }

            return normalized;
        };
    }

    /**
     * ASOS Measurement Extractor - Advanced
     */
    function AsosExtractor() {
        this.extract = function() {
            const measurements = {
                source: 'ASOS',
                productTitle: this.getProductTitle(),
                type: this.detectGarmentType(),
                url: window.location.href
            };

            // Multiple extraction strategies
            const measurementsFound = {};

            // Strategy 1: Size guide/modals
            this.triggerSizeGuide();

            // Strategy 2: Size chart tables and grids
            Object.assign(measurementsFound, this.extractFromSizeCharts());

            // Strategy 3: Product information sections
            Object.assign(measurementsFound, this.extractFromProductInfo());

            // Strategy 4: Specifications and details
            Object.assign(measurementsFound, this.extractFromSpecs());

            // Strategy 5: Product description
            Object.assign(measurementsFound, this.extractFromDescription());

            // Normalize measurements to inches
            const normalized = this.normalizeMeasurements(measurementsFound);

            return { ...measurements, ...normalized };
        };

        this.getProductTitle = function() {
            const selectors = ['h1[class*="product-hero"]', '[class*="product-title"]', '[class*="heading"] h1', 'h1'];
            for (const selector of selectors) {
                const element = document.querySelector(selector);
                if (element && element.textContent.trim()) {
                    return element.textContent.trim();
                }
            }
            return 'Unknown Product';
        };

        this.detectGarmentType = function() {
            const title = this.getProductTitle().toLowerCase();
            const categoryElements = [
                ...document.querySelectorAll('[class*="breadcrumb"]'),
                ...document.querySelectorAll('[class*="category"]'),
                ...document.querySelectorAll('[class*="product-meta"]')
            ];

            let categoryText = '';
            categoryElements.forEach(el => {
                if (el.textContent) categoryText += el.textContent.toLowerCase() + ' ';
            });

            const combined = (title + ' ' + categoryText).toLowerCase();

            if (combined.includes('dress') && !combined.includes('sock')) {
                return 'dress';
            } else if (combined.includes('shirt') || combined.includes('top') || combined.includes('t-shirt') ||
                      combined.includes('blouse') || combined.includes('jumper') || combined.includes('sweater')) {
                return 'shirt';
            } else if (combined.includes('pant') || combined.includes('jeans') || combined.includes('trouser') ||
                      combined.includes('short') || combined.includes('legging') || combined.includes('jogger')) {
                return 'pants';
            } else if (combined.includes('shoe') || combined.includes('sneaker') || combined.includes('boot') ||
                      combined.includes('sandal') || combined.includes('heel') || combined.includes('trainer') ||
                      combined.includes('court shoe')) {
                return 'shoes';
            }
            return 'unknown';
        };

        this.triggerSizeGuide = function() {
            // Look for size guide buttons/links
            const sizeGuideSelectors = [
                '[class*="size-guide"] button',
                '[class*="sizeGuide"] button',
                'button[class*="size"]',
                'a[class*="size-guide"]',
                '[data-testid*="size-guide"] button'
            ];

            for (const selector of sizeGuideSelectors) {
                const elements = document.querySelectorAll(selector);
                if (elements.length > 0) {
                    try {
                        elements[0].click();
                        // Give time for modal to appear
                        break;
                    } catch(e) {
                        console.log('Could not click size guide button:', e);
                    }
                }
            }
        };

        this.extractFromSizeCharts = function() {
            const measurements = {};

            // Look for tables and measurement grids
            const tableSelectors = [
                'table',
                '[class*="size-chart"] table',
                '[class*="measurement"] table',
                '[class*="size-guide"] table'
            ];

            for (const tableSelector of tableSelectors) {
                const tables = document.querySelectorAll(tableSelector);
                for (const table of tables) {
                    const tableText = table.textContent.toLowerCase();
                    if (tableText.includes('size') && (tableText.includes('inch') || tableText.includes('cm') ||
                        tableText.includes('measurement') || tableText.includes('chest') || tableText.includes('waist'))) {

                        const rows = table.querySelectorAll('tr, [class*="row"]');
                        for (const row of rows) {
                            const cells = Array.from(row.querySelectorAll('td, th, [class*="cell"], div')).map(c => c.textContent.trim().toLowerCase());
                            const rowText = cells.join(' ');

                            // Extract measurements using patterns
                            for (const [key, pattern] of Object.entries(MEASUREMENT_PATTERNS)) {
                                const matches = [...rowText.matchAll(pattern)];
                                if (matches.length > 0) {
                                    const match = matches[0];
                                    const value = parseFloat(match[1] || match[2]);
                                    const unit = match[2] || match[3] || 'inch';

                                    if (value && value > 0 && !measurements[key]) {
                                        measurements[key] = { value, unit, raw: match[0] };
                                    }
                                }
                            }
                        }
                    }
                }
            }

            return measurements;
        };

        this.extractFromProductInfo = function() {
            const measurements = {};

            // Product information sections
            const infoSelectors = [
                '[class*="product-info"]',
                '[class*="product-details"]',
                '[class*="info-panel"]',
                '[class*="product-description"]:not([class*="full"])'
            ];

            for (const selector of infoSelectors) {
                const sections = document.querySelectorAll(selector);
                sections.forEach(section => {
                    const text = section.textContent;
                    Object.assign(measurements, this.parseMeasurementText(text));
                });
            }

            return measurements;
        };

        this.extractFromSpecs = function() {
            const measurements = {};

            // Specifications sections
            const specSelectors = [
                '[class*="specification"]',
                '[class*="spec"]',
                '[class*="details"]',
                '[class*="product-spec"]'
            ];

            for (const selector of specSelectors) {
                const specs = document.querySelectorAll(selector);
                specs.forEach(spec => {
                    const text = spec.textContent;
                    Object.assign(measurements, this.parseMeasurementText(text));
                });
            }

            return measurements;
        };

        this.extractFromDescription = function() {
            const measurements = {};

            // Detailed product description
            const descSelectors = [
                '[class*="product-description"]',
                '[class*="description-full"]',
                '[class*="product-detail"]',
                '[class*="pdp-description"]'
            ];

            for (const selector of descSelectors) {
                const descriptions = document.querySelectorAll(selector);
                descriptions.forEach(desc => {
                    const text = desc.textContent;
                    Object.assign(measurements, this.parseMeasurementText(text));
                });
            }

            return measurements;
        };

        this.parseMeasurementText = function(text) {
            const measurements = {};

            if (!text) return measurements;

            const lowerText = text.toLowerCase();

            for (const [key, pattern] of Object.entries(MEASUREMENT_PATTERNS)) {
                const matches = [...lowerText.matchAll(pattern)];
                if (matches.length > 0) {
                    const match = matches[0];
                    const value = parseFloat(match[1] || match[2]);
                    const unit = match[2] || (match[3] ? match[3].toLowerCase() : 'inch');

                    if (value && value > 0 && !measurements[key]) {
                        measurements[key] = { value, unit, raw: match[0] };
                    }
                }
            }

            return measurements;
        };

        this.normalizeMeasurements = function(measurements) {
            const normalized = {};

            for (const [key, data] of Object.entries(measurements)) {
                if (data && typeof data.value === 'number') {
                    // Convert to inches
                    let inches = data.value;
                    if (data.unit && UNIT_CONVERSIONS[data.unit.toLowerCase()]) {
                        inches = data.value * UNIT_CONVERSIONS[data.unit.toLowerCase()] / 2.54;
                    }
                    normalized[key] = Math.round(inches * 2) / 2; // Round to nearest 0.5 inch
                }
            }

            return normalized;
        };
    }

    /**
     * Send extracted measurements to Perfect Fit
     */
    function sendToPerfectFit(measurements) {
        // Store in sessionStorage to transfer between tabs
        sessionStorage.setItem('perfectfit_extracted', JSON.stringify(measurements));
        
        // Create notification
        showSuccess(measurements);
        
        // Try to open Perfect Fit in a new tab if it's not already open
        const perfectFitUrl = getPerfectFitUrl();
        window.open(perfectFitUrl, 'perfectfit');
    }

    /**
     * Get Perfect Fit URL (configurable)
     */
    function getPerfectFitUrl() {
        // If running locally
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return window.location.origin + '/index.html';
        }
        // If running on GitHub Pages or similar
        if (window.location.hostname.includes('github.io')) {
            return window.location.origin + '/perfect-fit/index.html';
        }
        // If hosted online, try to detect the perfect-fit app
        return window.location.origin.includes('perfect-fit') ?
            window.location.origin + '/index.html' :
            'https://yourdomain.com/perfect-fit/index.html';
    }

    /**
     * Show success notification
     */
    function showSuccess(measurements) {
        const notification = createNotification(
            `✅ Measurements Extracted!<br>
            <strong>${measurements.productTitle}</strong><br>
            Type: ${measurements.type}<br>
            Found ${Object.keys(measurements).length - 3} measurements<br>
            <small>Opening Perfect Fit...</small>`,
            'success'
        );
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Show error notification
     */
    function showError(message) {
        const notification = createNotification('❌ ' + message, 'error');
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    /**
     * Create notification element
     */
    function createNotification(html, type) {
        const div = document.createElement('div');
        div.innerHTML = html;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#fee2e2' : '#d1fae5'};
            border: 2px solid ${type === 'error' ? '#ef4444' : '#10b981'};
            color: ${type === 'error' ? '#991b1b' : '#065f46'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 999999;
            max-width: 300px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px;
            line-height: 1.5;
        `;
        return div;
    }

})();
