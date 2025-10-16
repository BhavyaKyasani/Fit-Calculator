// Size recommendations page - Perfect Fit

class SizeRecommender {
    constructor() {
        this.measurements = {};
        this.brandSizes = {};
        this.loadMeasurements();
        this.initializeSizeCharts();
        this.setupEventListeners();
    }

    loadMeasurements() {
        // Load measurements from localStorage
        const stored = localStorage.getItem('perfect_fit_measurements');
        if (stored) {
            this.measurements = JSON.parse(stored);
            console.log('Loaded measurements:', this.measurements);
        } else {
            // Generate mock measurements for demo
            this.measurements = {
                chest: 40.5,
                waist: 32.0,
                hip: 39.5,
                shoulder: 18.2,
                sleeve: 34.1,
                inseam: 31.8,
                height: 68,
                weight: 165
            };
            console.log('Using demo measurements:', this.measurements);
        }
    }

    initializeSizeCharts() {
        this.calculateShirtSizes();
        this.calculatePantsSizes();
        this.calculateShoeSizes();
        this.updateUI();
    }

    calculateShirtSizes() {
        // Shirt size calculation logic
        const shirts = [
            { brand: 'H&M', chest: this.measurements.chest },
            { brand: 'Zara', chest: this.measurements.chest - 1.5 },
            { brand: 'Uniqlo', chest: this.measurements.chest },
            { brand: 'Nike', chest: this.measurements.chest + 1.0 }
        ];

        this.assignSizes(shirts, 'shirt');
    }

    calculatePantsSizes() {
        // Pants size calculation logic
        const pants = [
            { brand: 'Levi\'s', waist: this.measurements.waist },
            { brand: 'Gap', waist: this.measurements.waist },
            { brand: 'Old Navy', waist: this.measurements.waist - 0.5 },
            { brand: 'ASOS', waist: this.measurements.waist + 0.5 }
        ];

        this.assignSizes(pants, 'pants');
    }

    calculateShoeSizes() {
        // Shoe size calculation logic
        const shoes = [
            { brand: 'Nike', size: this.calculateFootSize() },
            { brand: 'Adidas', size: this.calculateFootSize() },
            { brand: 'Puma', size: this.calculateFootSize() },
            { brand: 'New Balance', size: this.calculateFootSize() - 0.5 }
        ];

        this.assignSizes(shoes, 'shoes');
    }

    calculateFootSize() {
        // Simple foot size estimation based on height
        const heightIn = this.measurements.height;
        if (heightIn < 64) return 8;
        if (heightIn < 67) return 8.5;
        if (heightIn < 70) return 9;
        if (heightIn < 73) return 9.5;
        return 10;
    }

    assignSizes(items, type) {
        items.forEach(item => {
            const baseMeasurement = Object.values(item)[1]; // Get the measurement value
            const variance = (Math.random() - 0.5) * 4; // -2 to +2 variance
            const adjusted = baseMeasurement + variance;

            let size, confidence, detail;

            if (type === 'shirt') {
                [size, detail] = this.getShirtSize(adjusted);
                confidence = this.calculateConfidence(variance);
            } else if (type === 'pants') {
                [size, detail] = this.getPantsSize(adjusted);
                confidence = this.calculateConfidence(variance);
            } else if (type === 'shoes') {
                [size, detail] = this.getShoeSize(adjusted);
                confidence = this.calculateConfidence(variance);
            }

            item.size = size;
            item.detail = detail;
            item.confidence = confidence;
        });

        this.brandSizes[type] = items;
    }

    getShirtSize(chest) {
        if (chest < 36) return ['XS', 'UK 6 / US 2'];
        if (chest < 38) return ['S', 'UK 8 / US 4'];
        if (chest < 40) return ['M', 'UK 10 / US 6'];
        if (chest < 42) return ['L', 'UK 12 / US 8'];
        if (chest < 44) return ['XL', 'UK 14 / US 10'];
        return ['XXL', 'UK 16 / US 12'];
    }

    getPantsSize(waist) {
        const waist32to36 = Math.floor(waist);
        if (waist32to36 < 28) return [`${waist32to36}W x 30L`, 'UK 6 / US 2'];
        if (waist32to36 < 30) return [`${waist32to36}W x 32L`, 'UK 8 / US 4'];
        if (waist32to36 < 32) return [`${waist32to36}W x 32L`, 'UK 10 / US 6'];
        if (waist32to36 < 34) return [`${waist32to36}W x 34L`, 'UK 12 / US 8'];
        return [`${waist32to36}W x 34L`, 'UK 14 / US 10'];
    }

    getShoeSize(size) {
        const uk = size - 1; // Rough US to UK conversion
        const eu = size + 33; // Rough US to EU conversion
        return [`US ${size}`, `UK ${uk} / EU ${eu}`];
    }

    calculateConfidence(variance) {
        const absVariance = Math.abs(variance);
        if (absVariance < 1) return 96 + Math.random() * 4; // 96-100%
        if (absVariance < 2) return 93 + Math.random() * 3; // 93-96%
        return 90 + Math.random() * 3; // 90-93%
    }

    updateUI() {
        // Update shirts
        const shirtCards = document.querySelectorAll('.size-category:nth-child(1) .brand-card');
        shirtCards.forEach((card, index) => {
            if (this.brandSizes.shirt && this.brandSizes.shirt[index]) {
                const brand = this.brandSizes.shirt[index];
                card.querySelector('.ai-confidence').textContent = `${brand.confidence.toFixed(0)}% match`;
                card.querySelector('.size-label').textContent = brand.size;
                card.querySelector('.size-detail').textContent = brand.detail;
            }
        });

        // Update pants
        const pantCards = document.querySelectorAll('.size-category:nth-child(2) .brand-card');
        pantCards.forEach((card, index) => {
            if (this.brandSizes.pants && this.brandSizes.pants[index]) {
                const brand = this.brandSizes.pants[index];
                card.querySelector('.ai-confidence').textContent = `${brand.confidence.toFixed(0)}% match`;
                card.querySelector('.size-label').textContent = brand.size;
                card.querySelector('.size-detail').textContent = brand.detail;
            }
        });

        // Update shoes
        const shoeCards = document.querySelectorAll('.size-category:nth-child(3) .brand-card');
        shoeCards.forEach((card, index) => {
            if (this.brandSizes.shoes && this.brandSizes.shoes[index]) {
                const brand = this.brandSizes.shoes[index];
                card.querySelector('.ai-confidence').textContent = `${brand.confidence.toFixed(0)}% match`;
                card.querySelector('.size-label').textContent = brand.size;
                card.querySelector('.size-detail').textContent = brand.detail;
            }
        });
    }

    setupEventListeners() {
        // Export functionality
        const pdfBtn = document.querySelector('.export-btn.pdf');
        const appBtn = document.querySelector('.export-btn.app');
        const shareBtn = document.querySelector('.export-btn.share');

        pdfBtn.addEventListener('click', () => this.exportAsPDF());
        appBtn.addEventListener('click', () => this.saveToApp());
        shareBtn.addEventListener('click', () => this.shareSizes());
    }

    exportAsPDF() {
        // Mock PDF export - in a real app, this would generate a PDF
        this.showNotification('PDF generation feature coming soon!', 'info');
    }

    saveToApp() {
        // Save to localStorage for persistence
        const sizeProfile = {
            measurements: this.measurements,
            brandSizes: this.brandSizes,
            generatedAt: new Date().toISOString()
        };

        localStorage.setItem('perfect_fit_size_profile', JSON.stringify(sizeProfile));
        this.showNotification('Size profile saved locally!', 'success');
    }

    shareSizes() {
        // Mock sharing - in a real app, this would generate shareable link/QR
        const sizeText = Object.entries(this.brandSizes)
            .map(([category, brands]) =>
                `${category.toUpperCase()}:\n${brands.map(b => `${b.brand}: ${b.size}`).join('\n')}`
            ).join('\n\n');

        navigator.clipboard.writeText(sizeText)
            .then(() => this.showNotification('Size recommendations copied to clipboard!', 'success'))
            .catch(() => this.showNotification('Copy to clipboard failed', 'error'));
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#d1fae5' : type === 'error' ? '#fee2e2' : '#dbeafe'};
            border: 2px solid ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: ${type === 'success' ? '#065f46' : type === 'error' ? '#991b1b' : '#1e40af'};
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
}

// Initialize size recommender when page loads
document.addEventListener('DOMContentLoaded', () => {
    new SizeRecommender();
});
