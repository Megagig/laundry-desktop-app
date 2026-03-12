# License Generation Workflow Diagram 📊

## Production License Workflow

```mermaid
graph TD
    A[Customer Inquiry] --> B[Sales Qualification]
    B --> C[Technical Assessment]
    C --> D[Purchase Order]
    D --> E[Collect Customer Info]
    
    E --> F[Get Machine ID]
    F --> G{Machine ID Valid?}
    G -->|No| F
    G -->|Yes| H[Generate License]
    
    H --> I[Verify License]
    I --> J{License Valid?}
    J -->|No| H
    J -->|Yes| K[Store in Database]
    
    K --> L[Secure Delivery]
    L --> M[Customer Activation]
    M --> N{Activation Success?}
    N -->|No| O[Support Assistance]
    O --> M
    N -->|Yes| P[Training & Onboarding]
    
    P --> Q[Ongoing Support]
    
    style A fill:#e1f5fe
    style H fill:#f3e5f5
    style K fill:#e8f5e8
    style P fill:#fff3e0
```

## License Management Workflow

```mermaid
graph TD
    A[License Request] --> B{Request Type}
    
    B -->|New License| C[Generate New]
    B -->|Extend License| D[Extend Existing]
    B -->|Revoke License| E[Revoke Existing]
    B -->|Verify License| F[Verify Status]
    
    C --> G[Interactive Generation]
    G --> H[Customer Details]
    H --> I[License Configuration]
    I --> J[Generate & Sign]
    J --> K[Store in DB]
    K --> L[Deliver to Customer]
    
    D --> M[Find License]
    M --> N[Set New Expiry]
    N --> O[Update Database]
    O --> P[Notify Customer]
    
    E --> Q[Find License]
    Q --> R[Confirm Revocation]
    R --> S[Update Status]
    S --> T[Log Reason]
    
    F --> U[Parse License Key]
    U --> V[Verify Signature]
    V --> W[Check Expiry]
    W --> X[Display Status]
    
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#ffebee
    style F fill:#e3f2fd
```

## Security Workflow

```mermaid
graph TD
    A[Initial Setup] --> B[Generate RSA Keys]
    B --> C[Secure Private Key]
    C --> D[Embed Public Key]
    D --> E[Production Ready]
    
    E --> F[Daily Operations]
    F --> G{Security Event?}
    G -->|No| F
    G -->|Key Compromise| H[Emergency Response]
    G -->|License Abuse| I[Investigation]
    G -->|System Breach| J[Incident Response]
    
    H --> K[Isolate System]
    K --> L[Generate New Keys]
    L --> M[Revoke Old Licenses]
    M --> N[Update Application]
    N --> O[Customer Notification]
    
    I --> P[Analyze Patterns]
    P --> Q[Revoke Suspicious]
    Q --> R[Contact Customers]
    R --> S[Issue Replacements]
    
    J --> T[Assess Damage]
    T --> U[Secure Systems]
    U --> V[Forensic Analysis]
    V --> W[Recovery Plan]
    
    style A fill:#e1f5fe
    style H fill:#ffebee
    style I fill:#fff3e0
    style J fill:#fce4ec
```

## Customer Onboarding Flow

```mermaid
graph TD
    A[License Generated] --> B[Welcome Package]
    B --> C[System Preparation]
    C --> D[Application Download]
    D --> E[Installation]
    E --> F[License Activation]
    
    F --> G{Activation Success?}
    G -->|No| H[Troubleshooting]
    H --> I[Support Assistance]
    I --> F
    G -->|Yes| J[Initial Configuration]
    
    J --> K[User Setup]
    K --> L[Data Import]
    L --> M[Training Session]
    M --> N[Go Live]
    
    N --> O[Follow-up Support]
    O --> P[Ongoing Relationship]
    
    style A fill:#e8f5e8
    style F fill:#f3e5f5
    style M fill:#fff3e0
    style N fill:#e1f5fe
```

## License Types Decision Tree

```mermaid
graph TD
    A[Customer Requirements] --> B{Business Size?}
    
    B -->|Individual/Small| C{Duration?}
    B -->|Medium Business| D{User Count?}
    B -->|Large Enterprise| E[Enterprise License]
    
    C -->|Evaluation| F[Trial License]
    C -->|Production| G[Standard License]
    
    D -->|5-25 Users| H[Professional License]
    D -->|25+ Users| E
    
    F --> I[14 Days, 1 User, Basic Features]
    G --> J[1 Year, 1-5 Users, Core Features]
    H --> K[1-3 Years, 5-25 Users, Advanced Features]
    E --> L[1-5 Years, Unlimited Users, All Features]
    
    style F fill:#ffebee
    style G fill:#e8f5e8
    style H fill:#e3f2fd
    style E fill:#f3e5f5
```

## Command Flow Reference

```mermaid
graph LR
    A[npm run license:] --> B{Command}
    
    B -->|keys| C[Generate RSA Keys]
    B -->|generate| D[Interactive Generation]
    B -->|verify| E[Verify License]
    B -->|list| F[List All Licenses]
    B -->|revoke| G[Revoke License]
    B -->|extend| H[Extend License]
    B -->|batch| I[Batch Generation]
    
    C --> C1[Create Private Key]
    C1 --> C2[Create Public Key]
    C2 --> C3[Set Permissions]
    
    D --> D1[Collect Customer Info]
    D1 --> D2[Configure License]
    D2 --> D3[Generate & Sign]
    D3 --> D4[Store in Database]
    
    E --> E1[Parse License Key]
    E1 --> E2[Verify Signature]
    E2 --> E3[Check Expiry]
    E3 --> E4[Display Results]
    
    F --> F1[Query Database]
    F1 --> F2[Display Statistics]
    F2 --> F3[List All Records]
    
    G --> G1[Find License]
    G1 --> G2[Confirm Action]
    G2 --> G3[Update Status]
    G3 --> G4[Log Reason]
    
    H --> H1[Find License]
    H1 --> H2[Set New Expiry]
    H2 --> H3[Update Database]
    
    I --> I1[Configure Batch]
    I1 --> I2[Generate Multiple]
    I2 --> I3[Export Results]
    
    style C fill:#e1f5fe
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#f3e5f5
    style G fill:#ffebee
    style H fill:#e3f2fd
    style I fill:#fce4ec
```

---

## Quick Reference Commands

### Setup Commands
```bash
cd license-generator
npm install                    # Install dependencies
npm run license:keys          # Generate RSA key pair (first time)
npm test                      # Verify installation
```

### Daily Operations
```bash
npm run license:generate      # Generate new license
npm run license:verify [key]  # Verify license key
npm run license:list          # View all licenses
npm run license:extend [id]   # Extend license
npm run license:revoke [id]   # Revoke license
```

### Batch Operations
```bash
npm run license:batch         # Generate multiple licenses
```

### Emergency Commands
```bash
npm run license:keys          # Generate new key pair (if compromised)
npm run license:list | grep "ACTIVE"  # List active licenses
```

---

**📋 This workflow ensures secure, efficient license generation and management for LaundryPro customers.**