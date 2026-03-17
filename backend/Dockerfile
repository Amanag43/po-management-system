# ── BASE IMAGE ──────────────────────────────────────
# Start from official Node.js 18 image
# Think of this as a clean computer with Node.js pre-installed
FROM node:18-alpine
# alpine = lightweight Linux, much smaller than full Linux

# ── WORKING DIRECTORY ────────────────────────────────
# Create and go into /app folder inside container
WORKDIR /app

# ── COPY PACKAGE FILES ───────────────────────────────
# Copy package.json first (before rest of code)
# This way Docker caches npm install step
# Only re-runs if package.json changes
COPY package*.json ./

# ── INSTALL DEPENDENCIES ─────────────────────────────
RUN npm install --production
# --production = skip devDependencies (nodemon etc.)

# ── COPY SOURCE CODE ─────────────────────────────────
# Copy everything else into container
COPY . .

# ── EXPOSE PORT ──────────────────────────────────────
# Tell Docker this container uses port 5000
EXPOSE 5000

# ── START COMMAND ────────────────────────────────────
# Command to run when container starts
CMD ["node", "server.js"]