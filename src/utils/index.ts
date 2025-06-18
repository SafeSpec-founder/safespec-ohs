/**
 * Utility functions for the SafeSpec OHS application
 */
import { logger } from "./logger";

/**
 * Date formatting utilities
 */
export const dateUtils = {
  /**
   * Format a date string to a human-readable format
   * @param dateString ISO date string
   * @param format Optional format (default: 'medium')
   * @returns Formatted date string
   */
  formatDate(
    dateString: string,
    format: "short" | "medium" | "long" = "medium",
  ): string {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "";
    }

    try {
      switch (format) {
        case "short":
          return new Intl.DateTimeFormat("en-US", {
            month: "numeric",
            day: "numeric",
            year: "2-digit",
          }).format(date);
        case "long":
          return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "numeric",
            timeZoneName: "short",
          }).format(date);
        case "medium":
        default:
          return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(date);
      }
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  },

  /**
   * Format a date string to include time
   * @param dateString ISO date string
   * @returns Formatted date and time string
   */
  formatDateTime(dateString: string): string {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "";
    }

    try {
      return new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error formatting date time:", error);
      return dateString;
    }
  },

  /**
   * Get a relative time string (e.g., "2 hours ago")
   * @param dateString ISO date string
   * @returns Relative time string
   */
  getRelativeTimeString(dateString: string): string {
    if (!dateString) return "";

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    try {
      const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

      if (diffInSeconds < 60) {
        return rtf.format(-diffInSeconds, "second");
      }

      const diffInMinutes = Math.floor(diffInSeconds / 60);
      if (diffInMinutes < 60) {
        return rtf.format(-diffInMinutes, "minute");
      }

      const diffInHours = Math.floor(diffInMinutes / 60);
      if (diffInHours < 24) {
        return rtf.format(-diffInHours, "hour");
      }

      const diffInDays = Math.floor(diffInHours / 24);
      if (diffInDays < 30) {
        return rtf.format(-diffInDays, "day");
      }

      const diffInMonths = Math.floor(diffInDays / 30);
      if (diffInMonths < 12) {
        return rtf.format(-diffInMonths, "month");
      }

      const diffInYears = Math.floor(diffInMonths / 12);
      return rtf.format(-diffInYears, "year");
    } catch (error) {
      console.error("Error getting relative time:", error);
      return this.formatDate(dateString);
    }
  },

  /**
   * Check if a date is in the past
   * @param dateString ISO date string
   * @returns Boolean indicating if date is in the past
   */
  isPast(dateString: string): boolean {
    if (!dateString) return false;

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return false;
    }

    return date < new Date();
  },

  /**
   * Check if a date is today
   * @param dateString ISO date string
   * @returns Boolean indicating if date is today
   */
  isToday(dateString: string): boolean {
    if (!dateString) return false;

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return false;
    }

    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  },
};

/**
 * String utilities
 */
export const stringUtils = {
  /**
   * Truncate a string to a specified length
   * @param str String to truncate
   * @param length Maximum length
   * @param suffix Suffix to add when truncated (default: '...')
   * @returns Truncated string
   */
  truncate(str: string, length: number, suffix = "..."): string {
    if (!str) return "";
    if (str.length <= length) return str;
    return str.substring(0, length).trim() + suffix;
  },

  /**
   * Capitalize the first letter of a string
   * @param str String to capitalize
   * @returns Capitalized string
   */
  capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  /**
   * Convert a string to title case
   * @param str String to convert
   * @returns Title case string
   */
  toTitleCase(str: string): string {
    if (!str) return "";
    return str.replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
    );
  },

  /**
   * Generate a slug from a string
   * @param str String to convert
   * @returns Slug
   */
  slugify(str: string): string {
    if (!str) return "";
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  },

  /**
   * Generate initials from a name
   * @param name Full name
   * @param maxLength Maximum number of initials (default: 2)
   * @returns Initials
   */
  getInitials(name: string, maxLength = 2): string {
    if (!name) return "";

    return name
      .split(" ")
      .filter((part) => part.length > 0)
      .map((part) => part[0].toUpperCase())
      .slice(0, maxLength)
      .join("");
  },
};

/**
 * File utilities
 */
export const fileUtils = {
  /**
   * Get file extension from filename
   * @param filename Filename
   * @returns File extension
   */
  getFileExtension(filename: string): string {
    if (!filename) return "";
    return filename.split(".").pop()?.toLowerCase() || "";
  },

  /**
   * Get file type category based on extension
   * @param filename Filename or extension
   * @returns File type category
   */
  getFileType(
    filename: string,
  ):
    | "image"
    | "document"
    | "spreadsheet"
    | "presentation"
    | "pdf"
    | "video"
    | "audio"
    | "other" {
    if (!filename) return "other";

    const extension = this.getFileExtension(filename);

    const fileTypes: Record<
      string,
      | "image"
      | "document"
      | "spreadsheet"
      | "presentation"
      | "pdf"
      | "video"
      | "audio"
      | "other"
    > = {
      // Images
      jpg: "image",
      jpeg: "image",
      png: "image",
      gif: "image",
      svg: "image",
      webp: "image",

      // Documents
      doc: "document",
      docx: "document",
      txt: "document",
      rtf: "document",

      // Spreadsheets
      xls: "spreadsheet",
      xlsx: "spreadsheet",
      csv: "spreadsheet",

      // Presentations
      ppt: "presentation",
      pptx: "presentation",

      // PDFs
      pdf: "pdf",

      // Videos
      mp4: "video",
      mov: "video",
      avi: "video",
      webm: "video",

      // Audio
      mp3: "audio",
      wav: "audio",
      ogg: "audio",
    };

    return fileTypes[extension] || "other";
  },

  /**
   * Format file size to human-readable string
   * @param bytes File size in bytes
   * @param decimals Number of decimal places (default: 2)
   * @returns Formatted file size
   */
  formatFileSize(bytes: number, decimals = 2): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  },

  /**
   * Get icon name for file type
   * @param filename Filename or extension
   * @returns Icon name
   */
  getFileIconName(filename: string): string {
    const type = this.getFileType(filename);

    const iconMap: Record<string, string> = {
      image: "image",
      document: "description",
      spreadsheet: "table_chart",
      presentation: "slideshow",
      pdf: "picture_as_pdf",
      video: "videocam",
      audio: "audiotrack",
      other: "insert_drive_file",
    };

    return iconMap[type] || "insert_drive_file";
  },
};

/**
 * Validation utilities
 */
export const validationUtils = {
  /**
   * Validate email format
   * @param email Email to validate
   * @returns Boolean indicating if email is valid
   */
  isValidEmail(email: string): boolean {
    if (!email) return false;
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  },

  /**
   * Validate password strength
   * @param password Password to validate
   * @returns Object with validation result and message
   */
  validatePassword(password: string): { isValid: boolean; message: string } {
    if (!password) {
      return { isValid: false, message: "Password is required" };
    }

    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!hasUpperCase) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (!hasLowerCase) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (!hasNumbers) {
      return {
        isValid: false,
        message: "Password must contain at least one number",
      };
    }

    if (!hasSpecialChars) {
      return {
        isValid: false,
        message: "Password must contain at least one special character",
      };
    }

    return { isValid: true, message: "Password is strong" };
  },

  /**
   * Validate phone number format
   * @param phone Phone number to validate
   * @returns Boolean indicating if phone number is valid
   */
  isValidPhone(phone: string): boolean {
    if (!phone) return false;
    const re = /^\+?[1-9]\d{1,14}$/;
    return re.test(phone.replace(/\s+/g, ""));
  },
};

/**
 * Color utilities
 */
export const colorUtils = {
  /**
   * Get color for severity level
   * @param severity Severity level
   * @returns Color code
   */
  getSeverityColor(severity: "critical" | "high" | "medium" | "low"): string {
    const colors: Record<string, string> = {
      critical: "#d32f2f", // Red
      high: "#f57c00", // Orange
      medium: "#fbc02d", // Yellow
      low: "#388e3c", // Green
    };

    return colors[severity] || "#757575"; // Default gray
  },

  /**
   * Get color for status
   * @param status Status value
   * @returns Color code
   */
  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      open: "#2196f3", // Blue
      in_progress: "#9c27b0", // Purple
      under_review: "#ff9800", // Orange
      completed: "#4caf50", // Green
      closed: "#4caf50", // Green
      verified: "#4caf50", // Green
      overdue: "#f44336", // Red
    };

    return colors[status] || "#757575"; // Default gray
  },

  /**
   * Get contrasting text color (black or white) for a background color
   * @param backgroundColor Background color in hex format
   * @returns Text color (black or white)
   */
  getContrastColor(backgroundColor: string): string {
    // Remove # if present
    const hex = backgroundColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    // Return black for bright colors, white for dark colors
    return luminance > 0.5 ? "#000000" : "#ffffff";
  },
};

/**
 * Object utilities
 */
export const objectUtils = {
  /**
   * Deep clone an object
   * @param obj Object to clone
   * @returns Cloned object
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }

    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.error("Error deep cloning object:", error);
      return obj;
    }
  },

  /**
   * Check if two objects are equal
   * @param obj1 First object
   * @param obj2 Second object
   * @returns Boolean indicating if objects are equal
   */
  isEqual(obj1: any, obj2: any): boolean {
    try {
      return JSON.stringify(obj1) === JSON.stringify(obj2);
    } catch (error) {
      console.error("Error comparing objects:", error);
      return false;
    }
  },

  /**
   * Get object difference
   * @param obj1 Original object
   * @param obj2 New object
   * @returns Object containing differences
   */
  getDifference(obj1: any, obj2: any): any {
    if (obj1 === obj2) return {};

    if (!obj1 || !obj2) return obj2 || obj1;

    const diff: any = {};

    // Check for properties in obj2 that differ from obj1
    Object.keys(obj2).forEach((key) => {
      if (!Object.prototype.hasOwnProperty.call(obj1, key)) {
        diff[key] = obj2[key]; // Property doesn't exist in obj1
      } else if (
        typeof obj2[key] === "object" &&
        obj2[key] !== null &&
        typeof obj1[key] === "object" &&
        obj1[key] !== null
      ) {
        const nestedDiff = this.getDifference(obj1[key], obj2[key]);
        if (Object.keys(nestedDiff).length > 0) {
          diff[key] = nestedDiff;
        }
      } else if (obj1[key] !== obj2[key]) {
        diff[key] = obj2[key]; // Property value has changed
      }
    });

    return diff;
  },
};

/**
 * Array utilities
 */
export const arrayUtils = {
  /**
   * Group array items by a key
   * @param array Array to group
   * @param key Key to group by
   * @returns Grouped object
   */
  groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
    return array.reduce(
      (result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
          result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
      },
      {} as Record<string, T[]>,
    );
  },

  /**
   * Sort array by a key
   * @param array Array to sort
   * @param key Key to sort by
   * @param direction Sort direction (default: 'asc')
   * @returns Sorted array
   */
  sortBy<T>(array: T[], key: keyof T, direction: "asc" | "desc" = "asc"): T[] {
    return [...array].sort((a, b) => {
      if (a[key] < b[key]) return direction === "asc" ? -1 : 1;
      if (a[key] > b[key]) return direction === "asc" ? 1 : -1;
      return 0;
    });
  },

  /**
   * Remove duplicates from array
   * @param array Array with potential duplicates
   * @param key Optional key to check for duplicates
   * @returns Array without duplicates
   */
  unique<T>(array: T[], key?: keyof T): T[] {
    if (!key) {
      return [...new Set(array)];
    }

    const seen = new Set();
    return array.filter((item) => {
      const value = item[key];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
      return true;
    });
  },
};

/**
 * Export all utilities
 */
export default {
  date: dateUtils,
  string: stringUtils,
  file: fileUtils,
  validation: validationUtils,
  color: colorUtils,
  object: objectUtils,
  array: arrayUtils,
  logger: logger,
};

export { logger } from "./logger";
