# Performance Testing Tools Setup

## 🎯 Available Tools

### 1. Artillery (✅ Installed Locally)

**Status**: ✅ Ready to use

**Installation**: Already installed as dev dependency
```bash
npm install  # Artillery will be installed automatically
```

**Usage**:
```bash
npm run test:load
# or
npx artillery run artillery-config.yml
```

**Config File**: `artillery-config.yml`

---

### 2. k6 (⚠️ Optional - Requires Separate Installation)

**Status**: ⚠️ Not installed (optional)

**Why Optional**: 
- Artillery already provides load testing
- k6 requires separate installation
- Both tools do similar things

**Installation (Windows)**:

**Option 1: Chocolatey**
```bash
# Install Chocolatey first (if not installed)
# Then:
choco install k6
```

**Option 2: winget (Windows 10/11)**
```bash
winget install k6
```

**Option 3: Manual Download**
1. Go to https://k6.io/docs/getting-started/installation/
2. Download Windows installer
3. Install and add to PATH

**Usage** (after installation):
```bash
k6 run load-test.js
```

**Config File**: `load-test.js`

---

### 3. Apache Bench (⚠️ Optional)

**Status**: ⚠️ Not installed (optional)

**Installation (Windows)**:
```bash
# Option 1: Chocolatey
choco install apache-httpd

# Option 2: Git Bash (usually included)
# Or download from Apache website
```

**Usage**:
```bash
ab -n 1000 -c 10 http://localhost:5000/health
```

---

## 🚀 Quick Start (Recommended)

### Use Artillery (Already Installed)

```bash
# 1. Start your server
npm run dev

# 2. In another terminal, run load test
npm run test:load
```

**That's it!** Artillery нь бүх зүйлийг хийх болно.

---

## 📊 Tool Comparison

| Tool | Status | Installation | Best For |
|------|--------|--------------|----------|
| **Artillery** | ✅ Installed | `npm install` | Full-featured load testing |
| **k6** | ⚠️ Optional | Separate install | Modern, scriptable |
| **Apache Bench** | ⚠️ Optional | Separate install | Simple, quick tests |

---

## 💡 Recommendation

**For Most Users**: Use Artillery (already installed)
```bash
npm run test:load
```

**Why Artillery?**
- ✅ Already installed (no extra steps)
- ✅ Full-featured (scenarios, phases, reports)
- ✅ Easy to use
- ✅ Good documentation

**When to Use k6?**
- Advanced scripting needs
- CI/CD integration
- Team already uses k6

---

## 🔧 Troubleshooting

### k6 Command Not Found
**Solution**: k6 is not installed. Either:
1. Install k6 (see above)
2. Use Artillery instead: `npm run test:load`

### Artillery Not Found
**Solution**: 
```bash
npm install
```

### Apache Bench Not Found
**Solution**: Install via Chocolatey or use Artillery instead.

---

## 📚 Resources

- **Artillery Docs**: https://www.artillery.io/docs
- **k6 Docs**: https://k6.io/docs
- **Apache Bench**: https://httpd.apache.org/docs/2.4/programs/ab.html

---

**Дүгнэлт**: Artillery нь бэлэн, ашиглах боломжтой. k6 болон Apache Bench нь optional, хэрэв шаардлагатай бол суулгаж болно.

