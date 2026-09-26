# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**iris-converge** is a unified management and operations portal for InterSystems IRIS.

Licensed under Apache 2.0.

## Status

This project is in early initialization. No build system, framework, or source code has been established yet. This file should be updated as the stack is chosen and the project takes shape.

## InterSystems IRIS Context

InterSystems IRIS is a data platform that uses ObjectScript as its native language. When integrating with IRIS:
- IRIS instances expose a REST API and management portal
- Native connectivity is available via JDBC/ODBC, and language-specific drivers (Python `irisnative`, Node.js `intersystems-iresnative`)
- ObjectScript namespaces and class definitions are the primary organizational unit
