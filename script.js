// Update year
document.getElementById('currentYear').textContent = new Date().getFullYear();

// DOM Elements
const clientIdInput = document.getElementById('clientId');
const validationStatus = document.getElementById('validationStatus');
const generateBtn = document.getElementById('generateBtn');
const inviteBtn = document.getElementById('inviteBtn');
const copyBtn = document.getElementById('copyBtn');
const generatedLink = document.getElementById('generatedLink');
let currentInviteLink = '';

// Validate Client ID against Discord API
async function validateClientId(clientId) {
    if (!/^\d{17,20}$/.test(clientId)) {
        return { valid: false, message: "Must be 18-20 digits" };
    }
    
    clientIdInput.classList.add('validating');
    clientIdInput.classList.remove('valid', 'invalid');
    validationStatus.textContent = "Checking Discord API...";
    validationStatus.className = "status-text validating-text";
    
    try {
        const response = await fetch(`https://discord.com/api/v10/applications/${clientId}/rpc`);
        
        if (response.ok) {
            clientIdInput.classList.replace('validating', 'valid');
            validationStatus.textContent = "✓ Valid Client ID";
            validationStatus.className = "status-text valid-text";
            return { valid: true };
        } else {
            throw new Error(`API returned ${response.status}`);
        }
    } catch (error) {
        clientIdInput.classList.replace('validating', 'invalid');
        validationStatus.textContent = "✗ Not a valid Discord application";
        validationStatus.className = "status-text invalid-text";
        return { 
            valid: false, 
            message: "No Discord application found with this ID" 
        };
    }
}

// Real-time validation on input
let validationTimeout;
clientIdInput.addEventListener('input', () => {
    clearTimeout(validationTimeout);
    const clientId = clientIdInput.value.trim();
    
    if (clientId.length === 0) {
        clientIdInput.classList.remove('validating', 'valid', 'invalid');
        validationStatus.textContent = "";
        return;
    }
    
    if (!/^\d{0,20}$/.test(clientId)) {
        clientIdInput.classList.add('invalid');
        validationStatus.textContent = "Only numbers allowed";
        validationStatus.className = "status-text invalid-text";
        return;
    }
    
    if (clientId.length >= 17) {
        validationTimeout = setTimeout(() => validateClientId(clientId), 800);
    }
});

// Generate invite link
generateBtn.addEventListener('click', async function() {
    const clientId = clientIdInput.value.trim();
    
    if (!clientId) {
        alert('Please enter a Client ID');
        return;
    }
    
    const validation = await validateClientId(clientId);
    if (!validation.valid) {
        alert(validation.message || "Invalid Client ID");
        return;
    }
    
    const botType = document.querySelector('input[name="botType"]:checked').value;
    let permissions, scope;
    
    if (botType === 'join-bot') {
        permissions = '2147503232';
        scope = 'bot%20applications.commands';
    } else {
        permissions = '268443664';
        scope = 'bot%20applications.commands';
    }
    
    currentInviteLink = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=${permissions}&scope=${scope}`;
    generatedLink.style.display = 'block';
});

// Open invite link in new window
inviteBtn.addEventListener('click', function() {
    if (currentInviteLink) {
        window.open(currentInviteLink, '_blank');
    }
});

// 100% Reliable Copy Functionality
copyBtn.addEventListener('click', function() {
    if (!currentInviteLink) return;
    
    // Create temporary textarea
    const textarea = document.createElement('textarea');
    textarea.value = currentInviteLink;
    textarea.classList.add('hidden-textarea');
    document.body.appendChild(textarea);
    
    // Select and copy
    textarea.select();
    
    try {
        // First try modern clipboard API
        if (navigator.clipboard) {
            navigator.clipboard.writeText(currentInviteLink)
                .then(() => showCopySuccess())
                .catch(() => fallbackCopy());
        } 
        // Fallback to execCommand
        else if (document.execCommand('copy')) {
            showCopySuccess();
        } 
        // Final fallback
        else {
            fallbackCopy();
        }
    } catch (e) {
        fallbackCopy();
    } finally {
        // Clean up
        document.body.removeChild(textarea);
    }
    
    function showCopySuccess() {
        const originalText = copyBtn.textContent;
        copyBtn.textContent = 'Copied!';
        copyBtn.style.backgroundColor = '#43B581';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.backgroundColor = '#7289DA';
        }, 2000);
    }
    
    function fallbackCopy() {
        generatedLink.innerHTML = `
            <div style="margin-top: 20px;">
                <p>Generated Invite Link:</p>
                <textarea id="manualCopy" rows="2">${currentInviteLink}</textarea>
                <div class="action-buttons">
                    <button onclick="window.open('${currentInviteLink}', '_blank')">Invite Bot</button>
                    <button onclick="location.reload()">Generate New Link</button>
                </div>
                <p>Please copy the link above manually</p>
            </div>
        `;
    }
});