#!/usr/bin/env bash
set -euo pipefail

KEYS_DIR="apps/api/keys"
mkdir -p "$KEYS_DIR"

echo "Generating RS256 key pair..."

# Generate 2048-bit RSA private key
openssl genrsa -out "$KEYS_DIR/private.pem" 2048

# Extract public key
openssl rsa -in "$KEYS_DIR/private.pem" -pubout -out "$KEYS_DIR/public.pem"

echo ""
echo "Keys generated:"
echo "  Private: $KEYS_DIR/private.pem"
echo "  Public:  $KEYS_DIR/public.pem"
echo ""
echo "For production (Railway env vars), base64-encode:"
echo "  JWT_PRIVATE_KEY=$(base64 -w 0 < $KEYS_DIR/private.pem)"
echo "  JWT_PUBLIC_KEY=$(base64 -w 0 < $KEYS_DIR/public.pem)"
echo ""
echo "WARNING: Keep private.pem secret. Never commit it."