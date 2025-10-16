// Perfect Fit - Fit Calculation Algorithm

/**
 * FitCalculator - Core logic for determining clothing fit
 */
const FitCalculator = {
    /**
     * Tolerance thresholds (in inches) for different fit categories
     */
    TOLERANCE: {
        PERFECT: 1.0,      // Within 1 inch = Perfect
        REGULAR: 2.0,      // Within 2 inches = Regular fit
        ACCEPTABLE: 3.0    // Within 3 inches = Acceptable but loose/tight
    },

    /**
     * Calculate overall fit based on user and garment measurements
     * @param {Object} userMeasurements - User's body measurements
     * @param {Object} garmentMeasurements - Garment measurements
     * @param {string} garmentType - Type of garment (shirt, pants, shoes, dress)
     * @returns {Object} Fit result with overall fit and detailed measurements
     */
    calculate(userMeasurements, garmentMeasurements, garmentType) {
        switch (garmentType) {
            case 'shirt':
                return this.calculateShirtFit(userMeasurements, garmentMeasurements);
            case 'pants':
                return this.calculatePantsFit(userMeasurements, garmentMeasurements);
            case 'shoes':
                return this.calculateShoesFit(userMeasurements, garmentMeasurements);
            case 'dress':
                return this.calculateDressFit(userMeasurements, garmentMeasurements);
            default:
                throw new Error('Invalid garment type');
        }
    },

    /**
     * Calculate shirt fit
     */
    calculateShirtFit(user, garment) {
        const measurements = {
            chest: this.compareMeasurement(user.chest, garment.chest, 'chest'),
            shoulder: this.compareMeasurement(user.shoulder, garment.shoulder, 'shoulder'),
            sleeve: this.compareMeasurement(user.sleeve, garment.sleeve, 'sleeve')
        };

        // Calculate overall fit
        const fits = Object.values(measurements).map(m => m.fit);
        const overallFit = this.determineOverallFit(fits);
        const description = this.generateShirtDescription(measurements, overallFit);

        return {
            overallFit,
            description,
            measurements
        };
    },

    /**
     * Calculate pants fit
     */
    calculatePantsFit(user, garment) {
        const measurements = {
            waist: this.compareMeasurement(user.waist, garment.waist, 'waist'),
            hip: this.compareMeasurement(user.hip, garment.hip, 'hip'),
            inseam: this.compareMeasurement(user.inseam, garment.inseam, 'inseam')
        };

        // Calculate overall fit
        const fits = Object.values(measurements).map(m => m.fit);
        const overallFit = this.determineOverallFit(fits);
        const description = this.generatePantsDescription(measurements, overallFit);

        return {
            overallFit,
            description,
            measurements
        };
    },

    /**
     * Calculate shoes fit
     */
    calculateShoesFit(user, garment) {
        const sizeDiff = garment.size - user.shoeSize;
        
        let fit = 'Perfect';
        if (Math.abs(sizeDiff) > 1) {
            fit = sizeDiff > 0 ? 'Loose' : 'Tight';
        } else if (Math.abs(sizeDiff) > 0.5) {
            fit = 'Regular';
        }

        const measurements = {
            size: {
                user: user.shoeSize,
                garment: garment.size,
                difference: sizeDiff,
                fit: fit
            }
        };

        const description = this.generateShoesDescription(measurements, fit);

        return {
            overallFit: fit,
            description,
            measurements
        };
    },

    /**
     * Calculate dress fit
     */
    calculateDressFit(user, garment) {
        const measurements = {
            bust: this.compareMeasurement(user.chest, garment.bust, 'bust'),
            waist: this.compareMeasurement(user.waist, garment.waist, 'waist'),
            hip: this.compareMeasurement(user.hip, garment.hip, 'hip')
        };

        // Calculate overall fit
        const fits = Object.values(measurements).map(m => m.fit);
        const overallFit = this.determineOverallFit(fits);
        const description = this.generateDressDescription(measurements, overallFit);

        return {
            overallFit,
            description,
            measurements
        };
    },

    /**
     * Compare individual measurement
     * @param {number} userMeasure - User's measurement
     * @param {number} garmentMeasure - Garment's measurement
     * @param {string} type - Type of measurement
     * @returns {Object} Comparison result
     */
    compareMeasurement(userMeasure, garmentMeasure, type) {
        const difference = garmentMeasure - userMeasure;
        const absDiff = Math.abs(difference);

        let fit = 'Perfect';
        
        // Determine fit category based on difference
        if (absDiff <= this.TOLERANCE.PERFECT) {
            fit = 'Perfect';
        } else if (absDiff <= this.TOLERANCE.REGULAR) {
            fit = 'Regular';
        } else {
            // For measurements that should be close to body
            if (['chest', 'bust', 'waist', 'hip'].includes(type)) {
                fit = difference > 0 ? 'Loose' : 'Tight';
            } else {
                // For measurements like sleeve, inseam, shoulder
                fit = difference > 0 ? 'Long' : 'Short';
            }
        }

        return {
            user: userMeasure,
            garment: garmentMeasure,
            difference: difference,
            fit: fit
        };
    },

    /**
     * Determine overall fit from individual measurements
     * @param {Array} fits - Array of individual fit assessments
     * @returns {string} Overall fit assessment
     */
    determineOverallFit(fits) {
        const tightCount = fits.filter(f => f === 'Tight' || f === 'Short').length;
        const looseCount = fits.filter(f => f === 'Loose' || f === 'Long').length;
        const perfectCount = fits.filter(f => f === 'Perfect').length;
        const regularCount = fits.filter(f => f === 'Regular').length;

        // All perfect
        if (perfectCount === fits.length) {
            return 'Perfect';
        }

        // Mostly perfect or regular
        if (perfectCount + regularCount === fits.length) {
            return 'Regular';
        }

        // Has tight measurements
        if (tightCount > 0) {
            return 'Tight';
        }

        // Has loose measurements
        if (looseCount > 0) {
            return 'Loose';
        }

        return 'Regular';
    },

    /**
     * Generate description for shirt fit
     */
    generateShirtDescription(measurements, overallFit) {
        const descriptions = {
            'Perfect': 'This shirt should fit you perfectly! All measurements are within ideal range.',
            'Regular': 'This shirt should fit well with a comfortable fit.',
            'Tight': 'This shirt may feel tight. Consider sizing up for better comfort.',
            'Loose': 'This shirt may feel loose. Consider sizing down for a better fit.'
        };

        let desc = descriptions[overallFit] || 'Fit assessment complete.';

        // Add specific problem areas
        const problems = [];
        if (measurements.chest.fit === 'Tight') problems.push('chest is too tight');
        if (measurements.chest.fit === 'Loose') problems.push('chest is too loose');
        if (measurements.shoulder.fit === 'Short') problems.push('shoulders are narrow');
        if (measurements.shoulder.fit === 'Long') problems.push('shoulders are wide');
        if (measurements.sleeve.fit === 'Short') problems.push('sleeves are short');
        if (measurements.sleeve.fit === 'Long') problems.push('sleeves are long');

        if (problems.length > 0) {
            desc += ' Note: ' + problems.join(', ') + '.';
        }

        return desc;
    },

    /**
     * Generate description for pants fit
     */
    generatePantsDescription(measurements, overallFit) {
        const descriptions = {
            'Perfect': 'These pants should fit you perfectly! All measurements are within ideal range.',
            'Regular': 'These pants should fit well with a comfortable fit.',
            'Tight': 'These pants may feel tight. Consider sizing up for better comfort.',
            'Loose': 'These pants may feel loose. Consider sizing down or using a belt.'
        };

        let desc = descriptions[overallFit] || 'Fit assessment complete.';

        // Add specific problem areas
        const problems = [];
        if (measurements.waist.fit === 'Tight') problems.push('waist is too tight');
        if (measurements.waist.fit === 'Loose') problems.push('waist is too loose');
        if (measurements.hip.fit === 'Tight') problems.push('hips are too tight');
        if (measurements.hip.fit === 'Loose') problems.push('hips are too loose');
        if (measurements.inseam.fit === 'Short') problems.push('length is short');
        if (measurements.inseam.fit === 'Long') problems.push('length is long');

        if (problems.length > 0) {
            desc += ' Note: ' + problems.join(', ') + '.';
        }

        return desc;
    },

    /**
     * Generate description for shoes fit
     */
    generateShoesDescription(measurements, overallFit) {
        const sizeDiff = measurements.size.difference;

        if (overallFit === 'Perfect') {
            return 'These shoes should fit you perfectly!';
        } else if (overallFit === 'Regular') {
            if (sizeDiff > 0) {
                return 'These shoes are slightly larger than your usual size but should still fit comfortably.';
            } else {
                return 'These shoes are slightly smaller than your usual size but may work with thin socks.';
            }
        } else if (overallFit === 'Tight') {
            return `These shoes are ${Math.abs(sizeDiff).toFixed(1)} size(s) smaller. They will likely be too tight.`;
        } else {
            return `These shoes are ${Math.abs(sizeDiff).toFixed(1)} size(s) larger. They will likely be too loose.`;
        }
    },

    /**
     * Generate description for dress fit
     */
    generateDressDescription(measurements, overallFit) {
        const descriptions = {
            'Perfect': 'This dress should fit you perfectly! All measurements are within ideal range.',
            'Regular': 'This dress should fit well with a comfortable fit.',
            'Tight': 'This dress may feel tight. Consider sizing up for better comfort.',
            'Loose': 'This dress may feel loose. Consider sizing down for a better fit.'
        };

        let desc = descriptions[overallFit] || 'Fit assessment complete.';

        // Add specific problem areas
        const problems = [];
        if (measurements.bust.fit === 'Tight') problems.push('bust is too tight');
        if (measurements.bust.fit === 'Loose') problems.push('bust is too loose');
        if (measurements.waist.fit === 'Tight') problems.push('waist is too tight');
        if (measurements.waist.fit === 'Loose') problems.push('waist is too loose');
        if (measurements.hip.fit === 'Tight') problems.push('hips are too tight');
        if (measurements.hip.fit === 'Loose') problems.push('hips are too loose');

        if (problems.length > 0) {
            desc += ' Note: ' + problems.join(', ') + '.';
        }

        return desc;
    },

    /**
     * Suggest better size based on measurements
     * @param {Object} measurements - Measurement comparisons
     * @param {string} currentSize - Current size (e.g., 'M', 'L', 'XL')
     * @returns {string} Suggested size
     */
    suggestSize(measurements, currentSize) {
        const sizeMap = {
            'XS': { up: 'S', down: null },
            'S': { up: 'M', down: 'XS' },
            'M': { up: 'L', down: 'S' },
            'L': { up: 'XL', down: 'M' },
            'XL': { up: 'XXL', down: 'L' },
            'XXL': { up: 'XXXL', down: 'XL' }
        };

        // Count tight vs loose measurements
        const measurementValues = Object.values(measurements);
        const tightCount = measurementValues.filter(m => m.fit === 'Tight' || m.fit === 'Short').length;
        const looseCount = measurementValues.filter(m => m.fit === 'Loose' || m.fit === 'Long').length;

        if (tightCount > looseCount && sizeMap[currentSize]) {
            return sizeMap[currentSize].up || currentSize;
        } else if (looseCount > tightCount && sizeMap[currentSize]) {
            return sizeMap[currentSize].down || currentSize;
        }

        return currentSize;
    }
};

// Export for use in other modules (if using ES6 modules)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FitCalculator;
}
