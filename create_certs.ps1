# Check if the script can run with the current execution policy
if ((Get-ExecutionPolicy) -ne 'Unrestricted' -and (Get-ExecutionPolicy) -ne 'RemoteSigned') {
    Write-Warning "Execution policy is set to $(Get-ExecutionPolicy). The script might not run as expected."
    Write-Host "Attempting to bypass execution policy for this session."
    Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
}

# Install Chocolatey
Write-Host "Installing Chocolatey..."
Set-ExecutionPolicy Bypass -Scope Process -Force
[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install mkcert
Write-Host "Installing mkcert..."
choco install mkcert -y

# Create a local CA
Write-Host "Creating local Certificate Authority (CA)..."
mkcert -install

# Ensure the certificates directory exists
$certificatesPath = "./certificates"
if (-not (Test-Path $certificatesPath)) {
    New-Item -ItemType Directory -Path $certificatesPath
    Write-Host "Created directory at $certificatesPath"
}

# Change directory to the certificates folder
Set-Location $certificatesPath

# Generate certificates for localhost
Write-Host "Generating localhost certificates..."
mkcert localhost 127.0.0.1 ::1

Write-Host "Certificates generated successfully in $certificatesPath"
