/**
 * Schema.org Structured Data Validator
 * 
 * Specialized tool for validating that our Schema.org implementation meets
 * Google's structured data guidelines for rich snippets
 */

// Configuration
const SCHEMA_VALIDATOR_CONFIG = {
    runOnLoad: true,       // Run validator automatically when page loads
    displayResults: true,  // Display validation results in console
    strictMode: false      // If true, validates optional fields as well
};

// Main validation function
function validateSchema() {
    console.group('🔍 Schema.org Structured Data Validation');
    const startTime = performance.now();
    
    // Get all schema.org scripts
    const schemaScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    if (!schemaScripts || schemaScripts.length === 0) {
        console.error('❌ No Schema.org structured data found on page');
        console.groupEnd();
        return {
            valid: false,
            errors: ['No Schema.org structured data found'],
            warnings: [],
            schemas: []
        };
    }
    
    console.log(`Found ${schemaScripts.length} schema.org data blocks`);
    
    // Process each schema block
    const results = [];
    let globalValid = true;
    const globalErrors = [];
    const globalWarnings = [];
    
    for (let i = 0; i < schemaScripts.length; i++) {
        const schemaScript = schemaScripts[i];
        
        try {
            // Parse the JSON
            const schema = JSON.parse(schemaScript.textContent);
            console.group(`Schema #${i+1}: ${schema['@type'] || 'Unknown Type'}`);
            
            // Validate the schema
            const validationResult = validateSchemaObject(schema);
            results.push(validationResult);
            
            // Add any errors or warnings to the global lists
            if (validationResult.errors.length > 0) {
                globalValid = false;
                globalErrors.push(...validationResult.errors.map(e => `Schema #${i+1}: ${e}`));
            }
            
            if (validationResult.warnings.length > 0) {
                globalWarnings.push(...validationResult.warnings.map(w => `Schema #${i+1}: ${w}`));
            }
            
            // Log the result
            if (validationResult.valid) {
                console.log(`✅ Schema #${i+1} is valid`);
            } else {
                console.error(`❌ Schema #${i+1} has ${validationResult.errors.length} errors`);
                validationResult.errors.forEach(e => console.error(`  - ${e}`));
            }
            
            if (validationResult.warnings.length > 0) {
                console.warn(`⚠️ Schema #${i+1} has ${validationResult.warnings.length} warnings`);
                validationResult.warnings.forEach(w => console.warn(`  - ${w}`));
            }
            
            console.groupEnd();
            
        } catch (e) {
            console.error(`❌ Failed to parse Schema #${i+1}: ${e.message}`);
            globalValid = false;
            globalErrors.push(`Schema #${i+1}: Invalid JSON - ${e.message}`);
            console.groupEnd();
        }
    }
    
    // Final results
    const endTime = performance.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    if (globalValid) {
        console.log(`✅ All schemas are valid! ${globalWarnings.length > 0 ? 'But there are some warnings.' : ''}`);
    } else {
        console.error(`❌ Schema validation failed with ${globalErrors.length} errors`);
    }
    
    console.log(`Validation completed in ${duration}s`);
    console.groupEnd();
    
    return {
        valid: globalValid,
        errors: globalErrors,
        warnings: globalWarnings,
        schemas: results,
        duration
    };
}

/**
 * Validates a specific schema object based on its @type
 */
function validateSchemaObject(schema) {
    // Initialize validation result
    const result = {
        valid: true,
        errors: [],
        warnings: [],
        type: schema['@type'] || 'Unknown'
    };
    
    // Check for @context
    if (!schema['@context']) {
        result.errors.push('Missing @context property (should be "https://schema.org")');
        result.valid = false;
    } else if (schema['@context'] !== 'https://schema.org' && 
              !schema['@context'].includes('schema.org')) {
        result.warnings.push(`@context should be "https://schema.org" but is "${schema['@context']}"`);
    }
    
    // Check for @type
    if (!schema['@type']) {
        result.errors.push('Missing @type property');
        result.valid = false;
        return result; // Can't validate further without type
    }
    
    // Validate based on the schema type
    switch (schema['@type']) {
        case 'WebApplication':
            validateWebApplication(schema, result);
            break;
            
        case 'Organization':
            validateOrganization(schema, result);
            break;
            
        case 'FAQPage':
            validateFAQPage(schema, result);
            break;
            
        default:
            result.warnings.push(`Unknown schema type: ${schema['@type']}`);
    }
    
    return result;
}

/**
 * Validates WebApplication schema
 */
function validateWebApplication(schema, result) {
    // Required fields for WebApplication
    const requiredFields = ['name', 'description'];
    
    // Recommended fields
    const recommendedFields = ['applicationCategory', 'offers'];
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!schema[field]) {
            result.errors.push(`Missing required field: ${field}`);
            result.valid = false;
        }
    });
    
    // Check recommended fields (as warnings)
    if (SCHEMA_VALIDATOR_CONFIG.strictMode) {
        recommendedFields.forEach(field => {
            if (!schema[field]) {
                result.warnings.push(`Missing recommended field: ${field}`);
            }
        });
    }
    
    // Check offers if present
    if (schema.offers) {
        if (!schema.offers['@type'] || schema.offers['@type'] !== 'Offer') {
            result.warnings.push('offers should have @type: "Offer"');
        }
        
        if (schema.offers.price !== undefined) {
            // Price must be a number or string representation of a number
            if (isNaN(Number(schema.offers.price))) {
                result.errors.push(`offers.price must be a number or string representation of a number, got: ${schema.offers.price}`);
                result.valid = false;
            }
            
            // If price is free (0), ensure it's explicitly marked as such
            if (schema.offers.price === '0' || schema.offers.price === 0) {
                if (!schema.offers.priceCurrency) {
                    result.warnings.push('Free offers should still include priceCurrency');
                }
            } else {
                // Non-free offers must have priceCurrency
                if (!schema.offers.priceCurrency) {
                    result.errors.push('Missing priceCurrency for non-free offer');
                    result.valid = false;
                }
            }
        } else {
            result.warnings.push('offers should include a price property');
        }
    }
}

/**
 * Validates Organization schema
 */
function validateOrganization(schema, result) {
    // Required fields for Organization
    const requiredFields = ['name'];
    
    // Recommended fields
    const recommendedFields = ['url', 'logo', 'description'];
    
    // Check required fields
    requiredFields.forEach(field => {
        if (!schema[field]) {
            result.errors.push(`Missing required field: ${field}`);
            result.valid = false;
        }
    });
    
    // Check recommended fields (as warnings)
    if (SCHEMA_VALIDATOR_CONFIG.strictMode) {
        recommendedFields.forEach(field => {
            if (!schema[field]) {
                result.warnings.push(`Missing recommended field: ${field}`);
            }
        });
    }
    
    // Check URL format if present
    if (schema.url && typeof schema.url === 'string') {
        try {
            new URL(schema.url);
        } catch (e) {
            result.errors.push(`Invalid URL format: ${schema.url}`);
            result.valid = false;
        }
    }
}

/**
 * Validates FAQPage schema
 */
function validateFAQPage(schema, result) {
    // Check for mainEntity
    if (!schema.mainEntity) {
        result.errors.push('Missing mainEntity property for FAQPage');
        result.valid = false;
        return;
    }
    
    // mainEntity should be an array
    if (!Array.isArray(schema.mainEntity)) {
        result.errors.push('mainEntity should be an array of Question items');
        result.valid = false;
        return;
    }
    
    // Each item should be a Question
    schema.mainEntity.forEach((item, index) => {
        if (!item['@type'] || item['@type'] !== 'Question') {
            result.errors.push(`Item ${index} in mainEntity should have @type: "Question"`);
            result.valid = false;
        }
        
        if (!item.name) {
            result.errors.push(`Item ${index} in mainEntity is missing required "name" property (the question text)`);
            result.valid = false;
        }
        
        if (!item.acceptedAnswer) {
            result.errors.push(`Item ${index} in mainEntity is missing required "acceptedAnswer" property`);
            result.valid = false;
        } else if (!item.acceptedAnswer['@type'] || item.acceptedAnswer['@type'] !== 'Answer') {
            result.errors.push(`Item ${index} acceptedAnswer should have @type: "Answer"`);
            result.valid = false;
        } else if (!item.acceptedAnswer.text) {
            result.errors.push(`Item ${index} acceptedAnswer is missing required "text" property (the answer text)`);
            result.valid = false;
        }
    });
}

// Run validation if configured to do so
if (SCHEMA_VALIDATOR_CONFIG.runOnLoad) {
    document.addEventListener('DOMContentLoaded', function() {
        // Wait for schema to be fully loaded
        setTimeout(validateSchema, 1000);
    });
}

// Export validation function for manual testing
window.SchemaValidator = {
    validate: validateSchema,
    config: SCHEMA_VALIDATOR_CONFIG
}; 