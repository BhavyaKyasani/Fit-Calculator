// FitFinder - Manual Clothing Fit Analyzer

class FitAnalyzer {
    constructor() {
        this.userMeasurements = {};
        this.productMeasurements = {};
        this.fitResults = {};
        this.currentClothingType = '';

        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Main analyze button
        document.getElementById('analyze-btn').addEventListener('click', () => this.handleAnalyze());

        // Manual input button
        document.getElementById('manual-input-btn').addEventListener('click', () => this.showManualModal());

        // Modal buttons
        document.getElementById('modal-cancel-btn').addEventListener('click', () => this.hideManualModal());
        document.getElementById('modal-analyze-btn').addEventListener('click', () => this.handleManualAnalysis());
        document.querySelector('.modal-close').addEventListener('click', () => this.hideManualModal());

        // Results buttons
        document.getElementById('new-analysis-btn').addEventListener('click', () => this.newAnalysis());
        document.getElementById('save-results-btn').addEventListener('click', () => this.saveResults());

        // Hero demo button
        document.querySelector('.analyze-btn').addEventListener('click', () => {
            document.querySelector('#analyzer').scrollIntoView({ behavior: 'smooth' });
        });
    }

    async handleAnalyze() {
        // Get user inputs
        if (!this.validateInputs()) {
            this.showError('Please fill in required fields (chest, waist, product URL, and clothing type).');
            return;
        }

        this.userMeasurements = this.getUserMeasurements();
        this.currentClothingType = document.getElementById('clothing-type').value;

        // Show loading
        document.getElementById('results-section').style.display = 'block';
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        this.showAnalyzingState();

        // Simulate analyzing delay
        await this.delay(2000);

        // Try to scrape product measurements
        const productUrl = document.getElementById('product-url').value;
        const success = await this.attemptUrlScraping(productUrl);

        if (!success) {
            this.showError('Unable to automatically extract measurements from this product page. Please use "Manual Measurement Entry" instead.');
            return;
        }

        this.performFitAnalysis();
    }

    validateInputs() {
        const chest = document.getElementById('chest').value;
        const waist = document.getElementById('waist').value;
        const productUrl = document.getElementById('product-url').value;
        const clothingType = document.getElementById('clothing-type').value;

        return chest && waist && productUrl && clothingType;
    }

    getUserMeasurements() {
        return {
            chest: parseFloat(document.getElementById('chest').value) || 0,
            waist: parseFloat(document.getElementById('waist').value) || 0,
            hips: parseFloat(document.getElementById('hips').value) || 0,
            shoulders: parseFloat(document.getElementById('shoulders').value) || 0,
            sleeve: parseFloat(document.getElementById('sleeve').value) || 0,
            inseam: parseFloat(document.getElementById('inseam').value) || 0
        };
    }

    async attemptUrlScraping(url) {
        // In a real implementation, this would make CORS-safe requests to scrape product data
        // For demo purposes, we'll simulate some common scenarios

        console.log('Attempting to scrape measurements from:', url);

        // Common retail patterns simulation
        if (url.includes('nike.com')) {
            this.productMeasurements = this.getNikeSizes(document.getElementById('product-size').value);
            return true;
        } else if (url.includes('zara.com')) {
            this.productMeasurements = this.getZaraSizes(document.getElementById('product-size').value);
            return true;
        } else if (url.includes('h&m.com') || url.includes('hm.com')) {
            this.productMeasurements = this.getHMSize(document.getElementById('product-size').value);
            return true;
        } else if (url.includes('amazon.com')) {
            this.productMeasurements = this.getAmazonSize(document.getElementById('product-size').value);
            return true;
        } else if (url.includes('levi.com')) {
            this.productMeasurements = this.getLeviSize(document.getElementById('product-size').value);
            return true;
        } else {
            // Fallback: generate mock measurements based on clothing type
            this.productMeasurements = this.generateMockMeasurements();
            return true;
        }
    }

    getNikeSizes(size) {
        const sizes = {
            'S': { chest: 38, waist: 30, hips: 0, shoulders: 0, sleeve: 0, inseam: 0 },
            'M': { chest: 41, waist: 32.5, hips: 0, shoulders: 0, sleeve: 0, inseam: 0 },
            'L': { chest: 44, waist: 35, hips: 0, shoulders: 0, sleeve: 0, inseam: 0 },
            'XL': { chest: 48, waist: 38.5, hips: 0, shoulders: 0, sleeve: 0, inseam: 0 }
        };
        return sizes[size.toUpperCase()] || this.generateMockMeasurements();
    }

    getZaraSizes(size) {
        const sizes = {
            'XS': { chest: 39.4, waist: 33.9, hips: 39.4, shoulders: 17.3, sleeve: 25.2, inseam: 0 },
            'S': { chest: 40.9, waist: 35.4, hips: 40.9, shoulders: 17.7, sleeve: 25.6, inseam: 0 },
            'M': { chest: 42.5, waist: 37.0, hips: 42.5, shoulders: 18.1, sleeve: 26.0, inseam: 0 },
            'L': { chest: 45.3, waist: 39.8, hips: 45.3, shoulders: 18.7, sleeve: 26.6, inseam: 0 }
        };
        return sizes[size.toUpperCase()] || this.generateMockMeasurements();
    }

    getHMSize(size) {
        const sizes = {
            'XS': { chest: 33.9, waist: 26.8, hips: 36.2, shoulders: 14.6, sleeve: 23.2, inseam: 30.7 },
            'S': { chest: 35.4, waist: 28.3, hips: 37.8, shoulders: 15.0, sleeve: 23.6, inseam: 31.1 },
            'M': { chest: 37.0, waist: 29.9, hips: 39.4, shoulders: 15.4, sleeve: 24.0, inseam: 31.5 },
            'L': { chest: 39.8, waist: 32.7, hips: 42.1, shoulders: 16.1, sleeve: 24.4, inseam: 31.9 },
            'XL': { chest: 42.9, waist: 35.8, hips: 45.3, shoulders: 17.1, sleeve: 24.8, inseam: 32.3 }
        };
        return sizes[size.toUpperCase()] || this.generateMockMeasurements();
    }

    getAmazonSize(size) {
        // Amazon sizing can vary greatly, defaulting to generic
        return this.generateMockMeasurements();
    }

    getLeviSize(size) {
        const sizes = {
            '28W x 30L': { chest: 0, waist: 28, hips: 0, shoulders: 0, sleeve: 0, inseam: 30 },
            '29W x 30L': { chest: 0, waist: 29, hips: 0, shoulders: 0, sleeve: 0, inseam: 30 },
            '30W x 30L': { chest: 0, waist: 30, hips: 0, shoulders: 0, sleeve: 0, inseam: 30 },
            '31W x 30L': { chest: 0, waist: 31, hips: 0, shoulders: 0, sleeve: 0, inseam: 30 },
            '32W x 32L': { chest: 0, waist: 32, hips: 0, shoulders: 0, sleeve: 0, inseam: 32 },
            '33W x 32L': { chest: 0, waist: 33, hips: 0, shoulders: 0, sleeve: 0, inseam: 32 },
            '34W x 32L': { chest: 0, waist: 34, hips: 0, shoulders: 0, sleeve: 0, inseam: 32 },
            '36W x 34L': { chest: 0, waist: 36, hips: 0, shoulders: 0, sleeve: 0, inseam: 34 }
        };
        return sizes[size] || this.generateMockMeasurements();
    }

    generateMockMeasurements() {
        // Generate reasonable mock measurements based on clothing type
        const baseMeasurements = {
            shirt: { chest: 40 + Math.random() * 8, waist: 32 + Math.random() * 8, hips: 0, shoulders: 16 + Math.random() * 4, sleeve: 32 + Math.random() * 4, inseam: 0 },
            pants: { chest: 0, waist: 30 + Math.random() * 8, hips: 38 + Math.random() * 6, shoulders: 0, sleeve: 0, inseam: 30 + Math.random() * 4 },
            shoes: { chest: 0, waist: 0, hips: 0, shoulders: 0, sleeve: 0, inseam: 0, footLength: 10 + Math.random() * 2 },
        };

        return baseMeasurements[this.currentClothingType] || baseMeasurements.shirt;
    }

    performFitAnalysis() {
        console.log('Starting performFitAnalysis...');
        console.log('User measurements:', this.userMeasurements);
        console.log('Product measurements:', this.productMeasurements);

        this.fitResults = {
            overall: this.calculateOverallFit(),
            details: this.calculateDetailedFit(),
            recommendations: this.generateRecommendations()
        };

        console.log('Fit results calculated:', this.fitResults);

        this.displayResults();
        console.log('displayResults called');
    }

    calculateOverallFit() {
        const differences = [];
        let totalDiff = 0;
        let measurements = 0;

        const measurementsMap = {
            shirt: ['chest', 'shoulders', 'sleeve'],
            pants: ['waist', 'hips', 'inseam'],
            shorts: ['waist', 'inseam'],
            skirt: ['waist', 'hips'],
            dress: ['chest', 'waist', 'hips'],
            jacket: ['chest', 'shoulders', 'sleeve'],
            shoes: ['footLength']
        };

        const relevantMeasurements = measurementsMap[this.currentClothingType] || ['chest', 'waist'];

        relevantMeasurements.forEach(measure => {
            const userVal = this.userMeasurements[measure];
            const prodVal = this.productMeasurements[measure];

            if (userVal && prodVal && prodVal > 0) {
                const diff = prodVal - userVal;
                const absDiff = Math.abs(diff);
                differences.push({ measure, difference: diff, absolute: absDiff });
                totalDiff += absDiff;
                measurements++;
            }
        });

        const avgDiff = measurements > 0 ? totalDiff / measurements : 0;

        let fitLevel;
        if (avgDiff <= 0.5) {
            fitLevel = 'perfect';
        } else if (avgDiff <= 1.5) {
            fitLevel = 'good';
        } else if (avgDiff <= 3) {
            fitLevel = 'loose';
        } else {
            fitLevel = 'tight';
        }

        return { fitLevel, avgDifference: avgDiff, differences };
    }

    calculateDetailedFit() {
        const details = {};

        // Calculate individual measurement fit
        Object.keys(this.userMeasurements).forEach(measure => {
            const userVal = this.userMeasurements[measure];
            const prodVal = this.productMeasurements[measure];

            if (userVal && prodVal && prodVal > 0) {
                const diff = prodVal - userVal;
                const absDiff = Math.abs(diff);

                let status;
                if (absDiff <= 0.5) status = 'perfect';
                else if (absDiff <= 1.0) status = 'slight';
                else if (absDiff <= 2.0) status = 'moderate';
                else status = 'significant';

                details[measure] = {
                    user: userVal,
                    product: prodVal,
                    difference: diff,
                    status
                };
            }
        });

        return details;
    }

    generateRecommendations() {
        const overallFit = this.fitResults.overall;
        const recommendations = [];

        switch (overallFit.fitLevel) {
            case 'perfect':
                recommendations.push("🎯 Perfect match! This size should fit you exceptionally well.");
                if (overallFit.avgDifference < 0.3) {
                    recommendations.push("This is nearly a custom-tailored fit.");
                }
                break;

            case 'good':
                recommendations.push("👍 Good fit! This size should work well for you.");
                if (overallFit.avgDifference > 1) {
                    recommendations.push("There might be slight room for adjustment.");
                }
                break;

            case 'loose':
                recommendations.push("📏 Loose fit. Consider sizing down or checking the product description.");
                recommendations.push("This size provides extra room - good if you prefer comfortable fits.");
                break;

            case 'tight':
                recommendations.push("🔍 Tight fit. Consider sizing up to ensure comfort.");
                recommendations.push("This might feel restrictive - check return policy if unsure.");
                break;
        }

        return recommendations;
    }

    displayResults() {
        console.log('Starting displayResults...');
        console.log('Fit results:', this.fitResults);

        try {
            const resultsSection = document.getElementById('results-section');
            if (!resultsSection) {
                console.error('Results section not found!');
                return;
            }
            resultsSection.style.display = 'block';
            console.log('Results section displayed');

            // Update fit indicator
            const fitIcon = document.getElementById('fit-icon');
            const fitTitle = document.getElementById('fit-title');
            const fitDescription = document.getElementById('fit-description');

            if (!fitIcon || !fitTitle || !fitDescription) {
                console.error('Fit indicator elements not found!');
                return;
            }

            const fitLevel = this.fitResults.overall.fitLevel;
            console.log('Fit level:', fitLevel);

            switch (fitLevel) {
                case 'perfect':
                    fitIcon.textContent = '🎯';
                    fitTitle.textContent = 'Perfect Fit!';
                    fitDescription.textContent = 'This size is an excellent match for your measurements.';
                    break;
                case 'good':
                    fitIcon.textContent = '👍';
                    fitTitle.textContent = 'Good Fit';
                    fitDescription.textContent = 'This size should work well with minor adjustments.';
                    break;
                case 'loose':
                    fitIcon.textContent = '📏';
                    fitTitle.textContent = 'Loose Fit';
                    fitDescription.textContent = 'This size is larger than your measurements.';
                    break;
                case 'tight':
                    fitIcon.textContent = '🔍';
                    fitTitle.textContent = 'Tight Fit';
                    fitDescription.textContent = 'This size is smaller than your measurements.';
                    break;
                default:
                    console.error('Unknown fit level:', fitLevel);
                    break;
            }

            console.log('Fit indicator updated');

            // Display user measurements
            this.displayUserMeasurements();

            // Display product measurements
            this.displayProductMeasurements();

            // Display fit differences
            this.displayFitDifferences();

            // Display recommendations
            this.displayRecommendations();

            console.log('All display methods completed');

        } catch (error) {
            console.error('Error in displayResults:', error);
        }
    }

    displayUserMeasurements() {
        const container = document.getElementById('user-measurements');
        container.innerHTML = '';

        Object.entries(this.userMeasurements).forEach(([measure, value]) => {
            if (value > 0) {
                const div = document.createElement('div');
                div.className = 'measurement-item';
                div.innerHTML = `
                    <span class="measurement-label">${this.capitalizeFirst(measure)}</span>
                    <span class="measurement-value">${value}"</span>
                `;
                container.appendChild(div);
            }
        });
    }

    displayProductMeasurements() {
        const container = document.getElementById('product-measurements');
        container.innerHTML = '';

        Object.entries(this.productMeasurements).forEach(([measure, value]) => {
            if (value > 0) {
                const div = document.createElement('div');
                div.className = 'measurement-item';
                div.innerHTML = `
                    <span class="measurement-label">${this.capitalizeFirst(measure)}</span>
                    <span class="measurement-value">${value}"</span>
                `;
                container.appendChild(div);
            }
        });
    }

    displayFitDifferences() {
        const container = document.getElementById('fit-differences');
        container.innerHTML = '';

        Object.entries(this.fitResults.details).forEach(([measure, detail]) => {
            const div = document.createElement('div');
            div.className = `measurement-item ${detail.status}`;
            const diffSymbol = detail.difference >= 0 ? '+' : '';
            div.innerHTML = `
                <span class="measurement-label">${this.capitalizeFirst(measure)}</span>
                <span class="measurement-value">${diffSymbol}${detail.difference.toFixed(1)}"</span>
            `;
            container.appendChild(div);
        });
    }

    displayRecommendations() {
        const container = document.getElementById('recommendations');
        container.innerHTML = '';

        this.fitResults.recommendations.forEach(rec => {
            const div = document.createElement('div');
            div.className = 'recommendation-item';
            div.textContent = rec;
            container.appendChild(div);
        });
    }

    showManualModal() {
        document.getElementById('manual-modal').style.display = 'flex';
    }

    hideManualModal() {
        document.getElementById('manual-modal').style.display = 'none';
    }

    async handleManualAnalysis() {
        if (!this.validateInputs()) {
            this.showError('Please fill in your measurements first.');
            return;
        }

        this.userMeasurements = this.getUserMeasurements();
        this.currentClothingType = document.getElementById('clothing-type').value;

        // Get manual product measurements
        this.productMeasurements = this.getManualProductMeasurements();

        this.hideManualModal();
        document.getElementById('results-section').style.display = 'block';
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
        this.showAnalyzingState();

        await this.delay(1000);
        this.performFitAnalysis();
    }

    getManualProductMeasurements() {
        return {
            chest: parseFloat(document.getElementById('prod-chest').value) || 0,
            waist: parseFloat(document.getElementById('prod-waist').value) || 0,
            hips: parseFloat(document.getElementById('prod-hips').value) || 0,
            shoulders: parseFloat(document.getElementById('prod-shoulders').value) || 0,
            sleeve: parseFloat(document.getElementById('prod-sleeve').value) || 0,
            inseam: parseFloat(document.getElementById('prod-inseam').value) || 0,
            length: parseFloat(document.getElementById('prod-length').value) || 0,
            footLength: parseFloat(document.getElementById('prod-foot-length').value) || 0
        };
    }

    showAnalyzingState() {
        document.getElementById('fit-icon').textContent = '⚖️';
        document.getElementById('fit-title').textContent = 'Analyzing...';
        document.getElementById('fit-description').textContent = 'Please wait while we analyze your fit';
    }

    newAnalysis() {
        document.getElementById('results-section').style.display = 'none';
        document.querySelector('#analyzer').scrollIntoView({ behavior: 'smooth' });
    }

    saveResults() {
        const results = {
            userMeasurements: this.userMeasurements,
            productMeasurements: this.productMeasurements,
            fitResults: this.fitResults,
            clothingType: this.currentClothingType,
            timestamp: new Date().toISOString()
        };

        localStorage.setItem('fitfinder_results', JSON.stringify(results));
        this.showNotification('Results saved locally!', 'success');
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    showError(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee2e2;
            border: 2px solid #ef4444;
            color: #991b1b;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px;
        `;
        notification.innerHTML = `<strong>Error:</strong> ${message}`;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 5000);
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d1fae5' : '#dbeafe'};
            border: 2px solid ${type === 'success' ? '#10b981' : '#3b82f6'};
            color: ${type === 'success' ? '#065f46' : '#1e40af'};
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 9999;
            max-width: 350px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
            font-size: 14px;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    new FitAnalyzer();
});
