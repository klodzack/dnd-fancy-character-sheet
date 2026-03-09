FROM mcr.microsoft.com/devcontainers/base:ubuntu-22.04

ARG DEBIAN_FRONTEND=noninteractive

# Install LaTeX and related tools
RUN apt-get update && apt-get install -y \
    texlive-latex-base \
    texlive-fonts-recommended \
    texlive-fonts-extra \
    texlive-latex-extra \
    texlive-xetex \
    latexmk \
    biber \
    perl \
    imagemagick \
    ghostscript \
    poppler-utils \
    # Stuff for installing node
    apt-transport-https \
    curl \
    software-properties-common \
    gnupg \
    ca-certificates \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" | tee /etc/apt/sources.list.d/nodesource.list \
    && apt-get update \
    && apt-get install -u nodejs \
    && rm -rf /var/lib/apt/lists/*

# Setup corepack
RUN npm install -g corepack \
    && corepack enable

# Create a non-root user for development (vscode user already exists in base image)
# Just ensure proper permissions
RUN mkdir -p /home/vscode/.local/share/texmf \
    && chown -R vscode:vscode /home/vscode/.local

ENV PATH="/home/vscode/.local/bin:${PATH}"
