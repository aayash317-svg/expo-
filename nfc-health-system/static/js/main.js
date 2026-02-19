document.addEventListener('DOMContentLoaded', () => {
    // Helper to handle form submissions via API
    const handleFormSubmit = async (event, url, redirectUrl) => {
        event.preventDefault();
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerText : 'Submit';

        // Basic Client-Side Validation
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        // Check for empty required fields
        for (let [key, value] of formData.entries()) {
            const input = form.querySelector(`[name="${key}"]`);
            if (input && input.hasAttribute('required') && !value.trim()) {
                alert(`Please fill in ${key.replace('_', ' ')}`);
                input.focus();
                return;
            }
        }

        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerText = "Processing...";
        }

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                if (result.redirect) {
                    window.location.href = result.redirect;
                } else if (redirectUrl) {
                    window.location.href = redirectUrl;
                } else {
                    alert(result.message || 'Success');
                    // Optional: form.reset();
                }
            } else {
                alert(result.error || 'An error occurred');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('A network error occurred.');
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerText = originalBtnText;
            }
        }
    };

    // Login and Registration are handled by page-specific scripts to manage role-based payloads
    /*
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => handleFormSubmit(e, '/api/auth/login'));
    }
    */

    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => handleFormSubmit(e, '/api/auth/register', '/'));
    }

    const scanForm = document.getElementById('scan-form');
    if (scanForm) {
        scanForm.addEventListener('submit', (e) => {
            // e.preventDefault();
            // Just let the form submit normally or handle via API?
            // The prompt says "Scanning option... extract ID... redirect"
            // Let's use the API handler for better UX
            handleFormSubmit(e, '/api/patient/scan');
        });
    }

    const addDataForm = document.getElementById('add-data-form');
    if (addDataForm) {
        addDataForm.addEventListener('submit', (e) => {
            // Get patient ID from hidden field or URL, but the form has it implicitly if we set it up right
            // The form action needs the patient ID
            const patientId = addDataForm.dataset.patientId;
            handleFormSubmit(e, `/api/patient/${patientId}/add`, '/');
        });
    }
});
