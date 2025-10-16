// Perfect Fit - Main Application Logic

// Storage Keys
const STORAGE_KEYS = {
    USER_MEASUREMENTS: 'perfectfit_user_measurements',
    USER_GENDER: 'perfectfit_user_gender'
};

// Initialize app on load
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

/**
 * Initialize the application
 */
function initializeApp() {
    // Check if user measurements exist
    const savedMeasurements = getUserMeasurements();
    
    if (savedMeasurements) {
        // Show fit checker if measurements exist
        loadSavedMeasurements();
        showFitChecker();
    }
    
    // Set up event listeners
    setupEventListeners();
}

/**
 * Set up all event listeners
 */
function setupEventListeners() {
    // User measurements form
    const measurementForm = document.getElementById('user-measurements-form');
    if (measurementForm) {
        measurementForm.addEventListener('submit', handleMeasurementSubmit);
    }
    
    // Product form
    const productForm = document.getElementById('product-form');
    if (productForm) {
        productForm.addEventListener('submit', handleProductSubmit);
    }
}

/**
 * Show measurement form
 */
function showMeasurementForm() {
    document.getElementById('welcome-section').classList.add('hidden');
    document.getElementById('measurement-section').classList.remove('hidden');
    document.getElementById('fit-checker-section').classList.add('hidden');
    
    // Scroll to measurement section
    document.getElementById('measurement-section').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Show fit checker
 */
function showFitChecker() {
    document.getElementById('welcome-section').classList.add('hidden');
    document.getElementById('measurement-section').classList.add('hidden');
    document.getElementById('fit-checker-section').classList.remove('hidden');

    // Check for bookmarklet-extracted measurements
    checkForExtractedMeasurements();

    // Scroll to fit checker section
    setTimeout(() => {
        document.getElementById('fit-checker-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

/**
 * Select gender
 */
function selectGender(gender) {
    // Update active button
    document.querySelectorAll('.gender-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-gender="${gender}"]`).classList.add('active');
    
    // Save gender
    localStorage.setItem(STORAGE_KEYS.USER_GENDER, gender);
}

/**
 * Handle measurement form submission
 */
function handleMeasurementSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const measurements = {
        gender: localStorage.getItem(STORAGE_KEYS.USER_GENDER) || 'male',
        chest: parseFloat(formData.get('chest') || document.getElementById('chest').value),
        shoulder: parseFloat(formData.get('shoulder') || document.getElementById('shoulder').value),
        sleeve: parseFloat(formData.get('sleeve') || document.getElementById('sleeve').value),
        waist: parseFloat(formData.get('waist') || document.getElementById('waist').value),
        hip: parseFloat(formData.get('hip') || document.getElementById('hip').value),
        inseam: parseFloat(formData.get('inseam') || document.getElementById('inseam').value),
        height: parseFloat(formData.get('height') || document.getElementById('height').value),
        weight: parseFloat(formData.get('weight') || document.getElementById('weight').value),
        shoeSize: parseFloat(formData.get('shoe-size') || document.getElementById('shoe-size').value),
        savedAt: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEYS.USER_MEASUREMENTS, JSON.stringify(measurements));
    
    // Show success notice
    const notice = document.getElementById('saved-notice');
    notice.classList.remove('hidden');
    
    // Show fit checker after delay
    setTimeout(() => {
        showFitChecker();
    }, 1500);
}

/**
 * Load saved measurements into form
 */
function loadSavedMeasurements() {
    const measurements = getUserMeasurements();
    if (!measurements) return;
    
    // Set gender
    selectGender(measurements.gender);
    
    // Set form values
    document.getElementById('chest').value = measurements.chest || '';
    document.getElementById('shoulder').value = measurements.shoulder || '';
    document.getElementById('sleeve').value = measurements.sleeve || '';
    document.getElementById('waist').value = measurements.waist || '';
    document.getElementById('hip').value = measurements.hip || '';
    document.getElementById('inseam').value = measurements.inseam || '';
    document.getElementById('height').value = measurements.height || '';
    document.getElementById('weight').value = measurements.weight || '';
    document.getElementById('shoe-size').value = measurements.shoeSize || '';
}

/**
 * Clear all measurements
 */
function clearMeasurements() {
    if (confirm('Are you sure you want to clear all your measurements?')) {
        localStorage.removeItem(STORAGE_KEYS.USER_MEASUREMENTS);
        localStorage.removeItem(STORAGE_KEYS.USER_GENDER);
        
        // Reset form
        document.getElementById('user-measurements-form').reset();
        
        // Hide notice
        document.getElementById('saved-notice').classList.add('hidden');
        
        // Show welcome screen
        document.getElementById('welcome-section').classList.remove('hidden');
        document.getElementById('measurement-section').classList.add('hidden');
        document.getElementById('fit-checker-section').classList.add('hidden');
        document.getElementById('results-section').classList.add('hidden');
        
        alert('Measurements cleared successfully!');
    }
}

/**
 * Get user measurements from localStorage
 */
function getUserMeasurements() {
    const data = localStorage.getItem(STORAGE_KEYS.USER_MEASUREMENTS);
    return data ? JSON.parse(data) : null;
}

/**
 * Update garment fields based on selected type
 */
function updateGarmentFields() {
    const garmentType = document.getElementById('garment-type').value;
    const container = document.getElementById('garment-measurements');
    
    if (!garmentType) {
        container.classList.add('hidden');
        return;
    }
    
    container.classList.remove('hidden');
    
    let fieldsHTML = '';
    
    switch (garmentType) {
        case 'shirt':
            fieldsHTML = `
                <h3>Shirt Measurements (inches)</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="garment-chest">Chest</label>
                        <input type="number" id="garment-chest" step="0.5" min="20" max="60" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-shoulder">Shoulder</label>
                        <input type="number" id="garment-shoulder" step="0.5" min="10" max="30" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-sleeve">Sleeve Length</label>
                        <input type="number" id="garment-sleeve" step="0.5" min="20" max="40" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-length">Body Length</label>
                        <input type="number" id="garment-length" step="0.5" min="20" max="40" required>
                    </div>
                </div>
            `;
            break;
            
        case 'pants':
            fieldsHTML = `
                <h3>Pants Measurements (inches)</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="garment-waist">Waist</label>
                        <input type="number" id="garment-waist" step="0.5" min="20" max="60" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-hip">Hip</label>
                        <input type="number" id="garment-hip" step="0.5" min="20" max="60" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-inseam">Inseam</label>
                        <input type="number" id="garment-inseam" step="0.5" min="20" max="40" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-rise">Rise</label>
                        <input type="number" id="garment-rise" step="0.5" min="8" max="16">
                    </div>
                </div>
            `;
            break;
            
        case 'shoes':
            fieldsHTML = `
                <h3>Shoe Measurements</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="garment-size">US Size</label>
                        <input type="number" id="garment-size" step="0.5" min="4" max="16" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-width">Width</label>
                        <select id="garment-width" class="form-control">
                            <option value="narrow">Narrow</option>
                            <option value="medium" selected>Medium</option>
                            <option value="wide">Wide</option>
                            <option value="extra-wide">Extra Wide</option>
                        </select>
                    </div>
                </div>
            `;
            break;
            
        case 'dress':
            fieldsHTML = `
                <h3>Dress Measurements (inches)</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="garment-bust">Bust</label>
                        <input type="number" id="garment-bust" step="0.5" min="20" max="60" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-waist">Waist</label>
                        <input type="number" id="garment-waist" step="0.5" min="20" max="60" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-hip">Hip</label>
                        <input type="number" id="garment-hip" step="0.5" min="20" max="60" required>
                    </div>
                    <div class="form-group">
                        <label for="garment-length">Length</label>
                        <input type="number" id="garment-length" step="0.5" min="30" max="60" required>
                    </div>
                </div>
            `;
            break;
    }
    
    container.innerHTML = fieldsHTML;
}

/**
 * Handle product form submission
 */
function handleProductSubmit(e) {
    e.preventDefault();
    
    const userMeasurements = getUserMeasurements();
    if (!userMeasurements) {
        alert('Please enter your measurements first!');
        showMeasurementForm();
        return;
    }
    
    const garmentType = document.getElementById('garment-type').value;
    const garmentMeasurements = extractGarmentMeasurements(garmentType);
    
    // Calculate fit
    const fitResult = calculateFit(userMeasurements, garmentMeasurements, garmentType);
    
    // Display results
    displayFitResults(fitResult, garmentType);
    
    // Generate recommendations
    generateRecommendations(fitResult, garmentType);
    
    // Show results section
    document.getElementById('results-section').classList.remove('hidden');
    
    // Scroll to results
    setTimeout(() => {
        document.getElementById('results-section').scrollIntoView({ behavior: 'smooth' });
    }, 100);
}

/**
 * Extract garment measurements from form
 */
function extractGarmentMeasurements(garmentType) {
    const measurements = { type: garmentType };
    
    switch (garmentType) {
        case 'shirt':
            measurements.chest = parseFloat(document.getElementById('garment-chest').value);
            measurements.shoulder = parseFloat(document.getElementById('garment-shoulder').value);
            measurements.sleeve = parseFloat(document.getElementById('garment-sleeve').value);
            measurements.length = parseFloat(document.getElementById('garment-length').value);
            break;
            
        case 'pants':
            measurements.waist = parseFloat(document.getElementById('garment-waist').value);
            measurements.hip = parseFloat(document.getElementById('garment-hip').value);
            measurements.inseam = parseFloat(document.getElementById('garment-inseam').value);
            measurements.rise = parseFloat(document.getElementById('garment-rise')?.value || 0);
            break;
            
        case 'shoes':
            measurements.size = parseFloat(document.getElementById('garment-size').value);
            measurements.width = document.getElementById('garment-width').value;
            break;
            
        case 'dress':
            measurements.bust = parseFloat(document.getElementById('garment-bust').value);
            measurements.waist = parseFloat(document.getElementById('garment-waist').value);
            measurements.hip = parseFloat(document.getElementById('garment-hip').value);
            measurements.length = parseFloat(document.getElementById('garment-length').value);
            break;
    }
    
    return measurements;
}

/**
 * Display fit results
 */
function displayFitResults(fitResult, garmentType) {
    const resultsContainer = document.getElementById('fit-results');
    
    const fitClass = `fit-${fitResult.overallFit.toLowerCase().replace(' ', '-')}`;
    
    let html = `
        <div class="fit-card">
            <div class="fit-status ${fitClass}">
                ${getFitEmoji(fitResult.overallFit)} ${fitResult.overallFit.toUpperCase()}
            </div>
            <p><strong>Overall Assessment:</strong> ${fitResult.description}</p>
            
            <div class="measurement-comparison">
    `;
    
    // Display individual measurement comparisons
    for (const [key, comparison] of Object.entries(fitResult.measurements)) {
        html += `
            <div class="measurement-item">
                <strong>${formatMeasurementName(key)}</strong>
                <div>Your: ${comparison.user}"</div>
                <div>Garment: ${comparison.garment}"</div>
                <div class="measurement-diff">${comparison.difference > 0 ? '+' : ''}${comparison.difference.toFixed(1)}" (${comparison.fit})</div>
            </div>
        `;
    }
    
    html += `
            </div>
        </div>
    `;
    
    resultsContainer.innerHTML = html;
}

/**
 * Get emoji for fit type
 */
function getFitEmoji(fit) {
    switch (fit.toLowerCase()) {
        case 'perfect': return '✅';
        case 'tight': return '❌';
        case 'loose': return '⚠️';
        case 'regular': return '✔️';
        default: return '❓';
    }
}

/**
 * Format measurement name for display
 */
function formatMeasurementName(name) {
    return name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, ' $1');
}

/**
 * Generate recommendations
 */
function generateRecommendations(fitResult, garmentType) {
    const recommendationsContainer = document.getElementById('recommendations');
    
    if (fitResult.overallFit === 'Perfect') {
        recommendationsContainer.innerHTML = `
            <div class="recommendation-card">
                <h3>🎉 Great Choice!</h3>
                <p>This garment appears to be a perfect fit for you. Go ahead and order with confidence!</p>
            </div>
        `;
        return;
    }
    
    let html = '<h3>🔍 Find Better Fits</h3>';
    
    // Determine size recommendation
    let sizeRecommendation = '';
    if (fitResult.overallFit === 'Tight') {
        sizeRecommendation = 'size up';
    } else if (fitResult.overallFit === 'Loose') {
        sizeRecommendation = 'size down';
    }
    
    html += `
        <div class="recommendation-card">
            <h4>Size Recommendation</h4>
            <p>Based on the measurements, we recommend you <strong>${sizeRecommendation}</strong> for a better fit.</p>
            <p class="info-text">Search for similar products in the recommended size on these stores:</p>
            <div class="search-links">
                <a href="https://www.amazon.com/s?k=${garmentType}" target="_blank" class="search-link">🛒 Amazon</a>
                <a href="https://www.myntra.com/search?q=${garmentType}" target="_blank" class="search-link">🛍️ Myntra</a>
                <a href="https://www.asos.com/search/?q=${garmentType}" target="_blank" class="search-link">👔 ASOS</a>
            </div>
        </div>
    `;
    
    // Specific recommendations based on fit issues
    const problemAreas = Object.entries(fitResult.measurements)
        .filter(([_, comp]) => comp.fit === 'Tight' || comp.fit === 'Loose')
        .map(([name, _]) => formatMeasurementName(name));
    
    if (problemAreas.length > 0) {
        html += `
            <div class="recommendation-card">
                <h4>Problem Areas</h4>
                <p>These measurements don't match your body perfectly:</p>
                <ul class="features">
                    ${problemAreas.map(area => `<li>${area}</li>`).join('')}
                </ul>
                <p class="info-text mt-1">Look for products with adjustable features in these areas or consider custom tailoring.</p>
            </div>
        `;
    }
    
    recommendationsContainer.innerHTML = html;
}

/**
 * Check for bookmarklet-extracted measurements
 */
function checkForExtractedMeasurements() {
    const extractedData = sessionStorage.getItem('perfectfit_extracted');
    if (!extractedData) return;

    try {
        const measurements = JSON.parse(extractedData);

        // Auto-populate the form if we have extracted data
        document.getElementById('garment-type').value = measurements.type;
        updateGarmentFields();

        // Fill in the measurements based on type
        setTimeout(() => {
            populateFormFromExtracted(measurements);
        }, 100); // Small delay to allow form fields to render

        // Clear the extracted data to avoid re-using it
        sessionStorage.removeItem('perfectfit_extracted');

        // Show a notification
        showExtractedNotification(measurements);

    } catch (error) {
        console.error('Error processing extracted measurements:', error);
    }
}

/**
 * Populate form fields from extracted measurements
 */
function populateFormFromExtracted(measurements) {
    switch (measurements.type) {
        case 'shirt':
            if (measurements.chest) document.getElementById('garment-chest').value = measurements.chest;
            if (measurements.shoulder) document.getElementById('garment-shoulder').value = measurements.shoulder;
            if (measurements.sleeve) document.getElementById('garment-sleeve').value = measurements.sleeve;
            // Length is typically not extracted automatically, user can fill
            break;

        case 'pants':
            if (measurements.waist) document.getElementById('garment-waist').value = measurements.waist;
            if (measurements.hip) document.getElementById('garment-hip').value = measurements.hip;
            if (measurements.inseam) document.getElementById('garment-inseam').value = measurements.inseam;
            break;

        case 'shoes':
            if (measurements.size) document.getElementById('garment-size').value = measurements.size;
            // Width is not typically extracted, defaults to medium
            break;

        case 'dress':
            if (measurements.bust) document.getElementById('garment-bust').value = measurements.bust;
            if (measurements.waist) document.getElementById('garment-waist').value = measurements.waist;
            if (measurements.hip) document.getElementById('garment-hip').value = measurements.hip;
            break;
    }
}

/**
 * Show notification about extracted measurements
 */
function showExtractedNotification(measurements) {
    const notification = document.createElement('div');
    notification.className = 'extracted-notification';
    notification.innerHTML = `
        🎯 <strong>Measurements Extracted!</strong><br>
        "${measurements.productTitle}"<br>
        <small>${measurements.source} • ${measurements.type}</small>
    `;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d1fae5;
        border: 2px solid #10b981;
        color: #065f46;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 9999;
        max-width: 300px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
        animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

/**
 * Calculate fit between user and garment measurements
 */
function calculateFit(userMeasurements, garmentMeasurements, garmentType) {
    // Call the FitCalculator from fit-calculator.js
    return FitCalculator.calculate(userMeasurements, garmentMeasurements, garmentType);
}
