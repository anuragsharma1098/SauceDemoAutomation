# Use official Playwright Docker image with all browsers pre-installed
FROM mcr.microsoft.com/playwright:v1.60.0

# Install additional dependencies as root
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    git \
    curl \
    sudo \
    && rm -rf /var/lib/apt/lists/*

# Allow pwuser to use sudo without password (for devcontainer compatibility)
RUN echo "pwuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/pwuser && \
    chmod 0440 /etc/sudoers.d/pwuser

# Install Allure CLI as root
RUN npm install -g allure-commandline

# Install global npm packages as root
RUN npm install -g \
    npm@latest \
    typescript

# Switch to pwuser (Playwright image user)
USER pwuser

# Set working directory
WORKDIR /workspace

# Default command
CMD ["/bin/bash"]
