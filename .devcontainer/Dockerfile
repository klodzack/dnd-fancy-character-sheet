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
    && rm -rf /var/lib/apt/lists/*

# Create a non-root user for development (vscode user already exists in base image)
# Just ensure proper permissions
RUN mkdir -p /home/vscode/.local/share/texmf \
    && chown -R vscode:vscode /home/vscode/.local

ENV PATH="/home/vscode/.local/bin:${PATH}"
