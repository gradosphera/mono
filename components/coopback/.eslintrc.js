{
  "env": {
    "node": true,
    "jest": true
  },
  "extends": ["airbnb-base", "plugin:jest/recommended", "plugin:security/recommended", "plugin:prettier/recommended"],
  "plugins": ["jest", "security", "prettier", "import"],
  "parserOptions": {
    "ecmaVersion": 2018
  },
  "rules": {
    "@typescript-eslint/no-explicit-any":"off",
    "no-console": "error",
    "func-names": "off",
    "no-underscore-dangle": "off",
    "consistent-return": "off",
    "jest/expect-expect": "off",
    "security/detect-object-injection": "off",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        "js": "never",
        "jsx": "never",
        "ts": "never",
        "tsx": "never"
      }
    ]
  }
}

