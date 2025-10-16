// AI Body Scan functionality - Perfect Fit

class AIBodyScanner {
    constructor() {
        this.video = document.getElementById('camera');
        this.canvas = document.getElementById('overlay-canvass');
        this.isScanning = false;
        this.measurements = {};
        this.scanStep = 0;
        this.cameraStream = null;

        this.initializeCamera();
        this.setupEventListeners();
    }

    async initializeCamera() {
        try {
            const constraints = {
                video: {
                    width: { ideal: 640, min: 320 },
                    height: { ideal: 480, min: 240 },
                    facingMode: 'user'
                }
            };

            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            this.video.srcObject = this.cameraStream;

            // Set up canvas for processing
            const ctx = this.canvas.getContext('2d');
            this.canvas.width = 640;
            this.canvas.height = 480;

        } catch (error) {
            console.error('Error accessing camera:', error);
            this.showError('Unable to access camera. Please ensure you have granted camera permissions.');
        }
    }

    setupEventListeners() {
        const startBtn = document.getElementById('start-scan-btn');
        const retakeBtn = document.getElementById('retake-scan-btn');

        startBtn.addEventListener('click', () => this.startScan());
        retakeBtn.addEventListener('click', () => this.retakeScan());
    }

    async startScan() {
        if (!this.cameraStream) {
            this.showError('Camera not available. Please refresh the page and try again.');
            return;
        }

        this.isScanning = true;
        await this.performScanProcess();
    }

    async performScanProcess() {
        const progressBar = document.getElementById('progress-fill');
        const instructionCards = document.querySelectorAll('.instruction-card');
        const loadingModal = document.getElementById('loading-modal');

        // Step 1: Preparation (20%)
        this.updateProgress(progressBar, 'Face the camera', 0);
        await this.delay(2000);
        instructionCards[0].style.display = 'none';
        instructionCards[1].style.display = 'block';

        // Step 2: Pose alignment (40%)
        this.updateProgress(progressBar, 'Assume pose', 20);
        await this.delay(2000);
        instructionCards[1].style.display = 'none';
        instructionCards[2].style.display = 'block';

        // Step 3: AI Processing (Show loading modal)
        this.updateProgress(progressBar, 'Processing...', 40);
        loadingModal.style.display = 'flex';

        await this.simulateAIScan();

        loadingModal.style.display = 'none';
        this.showResults();
    }

    async simulateAIScan() {
        // Simulate AI processing time
        const loadingSteps = document.querySelectorAll('.loading-step');

        for (let i = 0; i < loadingSteps.length; i++) {
            await this.delay(3000);
            loadingSteps[i].classList.remove('active');
            if (loadingSteps[i + 1]) {
                loadingSteps[i + 1].classList.add('active');
            }
        }

        // Generate mock measurements (in a real app, this would be actual AI processing)
        this.measurements = {
            chest: (36 + Math.random() * 8).toFixed(1),
            waist: (28 + Math.random() * 8).toFixed(1),
            hip: (36 + Math.random() * 6).toFixed(1),
            shoulder: (16 + Math.random() * 4).toFixed(1),
            sleeve: (32 + Math.random() * 4).toFixed(1),
            inseam: (30 + Math.random() * 4).toFixed(1),
            height: (64 + Math.random() * 12).toFixed(0),
            weight: (140 + Math.random() * 60).toFixed(0)
        };

        // Store in localStorage
        localStorage.setItem('perfect_fit_measurements', JSON.stringify(this.measurements));
    }

    updateProgress(progressBar, text, percentage) {
        progressBar.style.width = `${percentage}%`;
    }

    showResults() {
        // Update measurement display
        document.getElementById('chest-measurement').textContent = `${this.measurements.chest}"`;
        document.getElementById('waist-measurement').textContent = `${this.measurements.waist}"`;
        document.getElementById('hip-measurement').textContent = `${this.measurements.hip}"`;
        document.getElementById('shoulder-measurement').textContent = `${this.measurements.shoulder}"`;
        document.getElementById('sleeve-measurement').textContent = `${this.measurements.sleeve}"`;
        document.getElementById('inseam-measurement').textContent = `${this.measurements.inseam}"`;

        // Show results section
        document.querySelector('.scan-overlay').style.display = 'none';
        document.getElementById('results-section').style.display = 'block';

        this.isScanning = false;
    }

    retakeScan() {
        // Hide results, show instructions
        document.getElementById('results-section').style.display = 'none';
        document.querySelector('.scan-overlay').style.display = 'flex';

        // Reset progress
        document.getElementById('progress-fill').style.width = '0%';

        // Reset instruction cards
        const instructionCards = document.querySelectorAll('.instruction-card');
        instructionCards.forEach((card, index) => {
            card.style.display = index === 0 ? 'block' : 'none';
        });

        this.scanStep = 0;
    }

    showError(message) {
        // Create error notification
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

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize scanner when page loads
document.addEventListener('DOMContentLoaded', () => {
    new AIBodyScanner();
});
