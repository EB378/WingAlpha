module.exports = {
    // Existing configuration...
    settings: {
      react: {
        version: "detect", // Automatically detect the React version
      },
    },
    rules: {
      "react/react-in-jsx-scope": "off", // Disable this rule for React 17+ JSX transform
    },
  };
  