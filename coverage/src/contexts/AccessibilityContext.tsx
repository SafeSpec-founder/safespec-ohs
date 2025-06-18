import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface AccessibilityContextType {
  highContrast: boolean;
  largeText: boolean;
  focusVisible: boolean;
  reducedMotion: boolean;
  toggleHighContrast: () => void;
  toggleLargeText: () => void;
  toggleFocusVisible: () => void;
  toggleReducedMotion: () => void;
}

const defaultAccessibilityContext: AccessibilityContextType = {
  highContrast: false,
  largeText: false,
  focusVisible: true,
  reducedMotion: false,
  toggleHighContrast: () => {},
  toggleLargeText: () => {},
  toggleFocusVisible: () => {},
  toggleReducedMotion: () => {},
};

export const AccessibilityContext = createContext<AccessibilityContextType>(
  defaultAccessibilityContext,
);

export const useAccessibility = () => useContext(AccessibilityContext);

interface AccessibilityProviderProps {
  children: ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({
  children,
}) => {
  const [highContrast, setHighContrast] = useState<boolean>(
    localStorage.getItem("safespec-highContrast") === "true",
  );
  const [largeText, setLargeText] = useState<boolean>(
    localStorage.getItem("safespec-largeText") === "true",
  );
  const [focusVisible, setFocusVisible] = useState<boolean>(
    localStorage.getItem("safespec-focusVisible") !== "false",
  );
  const [reducedMotion, setReducedMotion] = useState<boolean>(
    localStorage.getItem("safespec-reducedMotion") === "true",
  );

  useEffect(() => {
    // Check for system preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (
      prefersReducedMotion &&
      localStorage.getItem("safespec-reducedMotion") === null
    ) {
      setReducedMotion(true);
    }

    // Apply accessibility settings to document
    document.documentElement.classList.toggle("high-contrast", highContrast);
    document.documentElement.classList.toggle("large-text", largeText);
    document.documentElement.classList.toggle("focus-visible", focusVisible);
    document.documentElement.classList.toggle("reduced-motion", reducedMotion);

    // Save preferences to localStorage
    localStorage.setItem("safespec-highContrast", highContrast.toString());
    localStorage.setItem("safespec-largeText", largeText.toString());
    localStorage.setItem("safespec-focusVisible", focusVisible.toString());
    localStorage.setItem("safespec-reducedMotion", reducedMotion.toString());
  }, [highContrast, largeText, focusVisible, reducedMotion]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);
  const toggleLargeText = () => setLargeText((prev) => !prev);
  const toggleFocusVisible = () => setFocusVisible((prev) => !prev);
  const toggleReducedMotion = () => setReducedMotion((prev) => !prev);

  const value = {
    highContrast,
    largeText,
    focusVisible,
    reducedMotion,
    toggleHighContrast,
    toggleLargeText,
    toggleFocusVisible,
    toggleReducedMotion,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};
