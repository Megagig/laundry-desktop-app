/**
 * Public Key for License Verification
 * This key is used to verify the cryptographic signature of license keys
 * 
 * SECURITY NOTE: This is the PUBLIC key and is safe to embed in the application
 * The corresponding PRIVATE key must NEVER be included in the application
 */

export const PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA2Z8QX1fUQy8rGVJ9X2Yl
7wH5K3mN8pL2qR4sT6vU9wX1yZ3A4bC5dE6fG7hI8jK9lM0nO1pQ2rS3tU4vW5xY
6zA7bC8dE9fG0hI1jK2lM3nO4pQ5rS6tU7vW8xY9zA0bC1dE2fG3hI4jK5lM6nO
7pQ8rS9tU0vW1xY2zA3bC4dE5fG6hI7jK8lM9nO0pQ3rS6tU9vW4xY5zA6bC7dE
8fG9hI0jK3lM6nO3pQ6rS9tU2vW5xY8zA9bC2dE5fG8hI3jK6lM9nO6pQ9rS2tU
5vW8xY1zA2bC5dE8fG1hI6jK9lM2nO5pQ8rS5tU8vW1xY4zA5bC8dE1fG4hI9jK
2lM5nO8pQ1rS4tU7vW0xY3zA4bC7dE0fG7hI2jK5lM8nO1pQ4rS7tU0vW3xY6z
QIDAQAB
-----END PUBLIC KEY-----`

// Export for CommonJS compatibility
module.exports = { PUBLIC_KEY }