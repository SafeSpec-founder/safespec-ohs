import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Grid,
  Box,
  Chip,
  Divider,
  Alert,
} from "@mui/material";
import { LocationOn, Gavel, Business, Public, Info } from "@mui/icons-material";

interface RegionalSettingsProps {
  settings: {
    country: string;
    region: string;
    complianceStandards: string[];
    regulatoryFramework: string;
  };
  onChange: (settings: any) => void;
}

const RegionalSettings: React.FC<RegionalSettingsProps> = ({
  settings,
  onChange,
}) => {
  const handleChange = (field: string, value: any) => {
    onChange({
      ...settings,
      [field]: value,
    });
  };

  const countries = [
    { code: "US", name: "United States", region: "North America" },
    { code: "CA", name: "Canada", region: "North America" },
    { code: "GB", name: "United Kingdom", region: "Europe" },
    { code: "DE", name: "Germany", region: "Europe" },
    { code: "FR", name: "France", region: "Europe" },
    { code: "AU", name: "Australia", region: "Oceania" },
    { code: "JP", name: "Japan", region: "Asia" },
    { code: "SG", name: "Singapore", region: "Asia" },
    { code: "BR", name: "Brazil", region: "South America" },
    { code: "MX", name: "Mexico", region: "North America" },
  ];

  const complianceStandards: Record<string, string[]> = {
    US: ["OSHA", "EPA", "NIOSH", "ISO 45001", "ANSI Z10"],
    CA: ["CCOHS", "CSA Z1000", "ISO 45001", "Provincial OH&S"],
    GB: ["HSE", "ISO 45001", "BS OHSAS 18001", "CDM Regulations"],
    DE: ["DGUV", "ISO 45001", "BetrSichV", "ArbSchG"],
    FR: ["INRS", "ISO 45001", "Code du travail", "CNAMTS"],
    AU: ["Safe Work Australia", "ISO 45001", "WHS Act", "AS/NZS 4801"],
    JP: ["JISHA", "ISO 45001", "Industrial Safety and Health Act"],
    SG: ["MOM", "ISO 45001", "WSH Act", "SS 506"],
    BR: ["MTE", "ISO 45001", "NR Standards", "CLT"],
    MX: ["STPS", "ISO 45001", "NOM Standards", "LFT"],
  };

  const regulatoryFrameworks: Record<string, string[]> = {
    US: ["OSHA", "EPA", "State Regulations"],
    CA: ["Federal OH&S", "Provincial OH&S"],
    GB: ["HSE Regulations", "EU Directives"],
    DE: ["German OH&S Law", "EU Directives"],
    FR: ["French Labor Code", "EU Directives"],
    AU: ["WHS Legislation", "State/Territory Laws"],
    JP: ["Japanese OH&S Law"],
    SG: ["WSH Act", "MOM Regulations"],
    BR: ["Brazilian Labor Law", "NR Standards"],
    MX: ["Mexican Labor Law", "NOM Standards"],
  };

  const selectedCountry = countries.find((c) => c.code === settings.country);
  const availableStandards = complianceStandards[settings.country] || [];
  const availableFrameworks = regulatoryFrameworks[settings.country] || [];

  const handleStandardsChange = (standards: string[]) => {
    handleChange("complianceStandards", standards);
  };

  const getRegionInfo = (country: string) => {
    const countryInfo = countries.find((c) => c.code === country);
    if (!countryInfo) return null;

    const regionDescriptions: Record<string, string> = {
      "North America":
        "OSHA-based safety standards with emphasis on workplace safety regulations",
      Europe:
        "EU directive compliance with ISO 45001 integration and national variations",
      Asia: "Mixed regulatory environment with increasing ISO 45001 adoption",
      Oceania:
        "Work Health and Safety (WHS) legislation with harmonized national approach",
      "South America":
        "Developing safety frameworks with international standard integration",
    };

    return {
      region: countryInfo.region,
      description:
        regionDescriptions[countryInfo.region] ||
        "Regional safety compliance requirements",
    };
  };

  const regionInfo = getRegionInfo(settings.country);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Public sx={{ mr: 1 }} />
          <Typography variant="h6">Regional & Compliance Settings</Typography>
        </Box>

        {/* Location Settings */}
        <Typography variant="subtitle1" gutterBottom>
          Location
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Country</InputLabel>
              <Select
                value={settings.country}
                label="Country"
                onChange={(e) => {
                  const country = e.target.value;
                  const countryInfo = countries.find((c) => c.code === country);
                  handleChange("country", country);
                  if (countryInfo) {
                    handleChange("region", countryInfo.region);
                  }
                  // Reset compliance settings when country changes
                  handleChange("complianceStandards", []);
                  handleChange("regulatoryFramework", "");
                }}
                startAdornment={<LocationOn sx={{ mr: 1 }} />}
              >
                {countries.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth disabled>
              <InputLabel>Region</InputLabel>
              <Select
                value={settings.region}
                label="Region"
                startAdornment={<Business sx={{ mr: 1 }} />}
              >
                <MenuItem value={settings.region}>{settings.region}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {regionInfo && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>{regionInfo.region}:</strong> {regionInfo.description}
            </Typography>
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Compliance Standards */}
        <Typography variant="subtitle1" gutterBottom>
          Compliance Standards
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select the safety and health standards applicable to your organization
        </Typography>

        {availableStandards.length > 0 ? (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {availableStandards.map((standard) => (
              <Grid item xs={12} sm={6} md={4} key={standard}>
                <Box
                  sx={{
                    p: 2,
                    border: 1,
                    borderColor: settings.complianceStandards.includes(standard)
                      ? "primary.main"
                      : "divider",
                    borderRadius: 1,
                    backgroundColor: settings.complianceStandards.includes(
                      standard,
                    )
                      ? "primary.light"
                      : "transparent",
                    cursor: "pointer",
                    "&:hover": {
                      borderColor: "primary.main",
                    },
                  }}
                  onClick={() => {
                    const newStandards = settings.complianceStandards.includes(
                      standard,
                    )
                      ? settings.complianceStandards.filter(
                          (s) => s !== standard,
                        )
                      : [...settings.complianceStandards, standard];
                    handleStandardsChange(newStandards);
                  }}
                >
                  <Typography variant="body2" fontWeight="medium">
                    {standard}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Alert severity="warning" sx={{ mb: 3 }}>
            No compliance standards available for the selected country. Please
            select a country first.
          </Alert>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Regulatory Framework */}
        <Typography variant="subtitle1" gutterBottom>
          Primary Regulatory Framework
        </Typography>
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Regulatory Framework</InputLabel>
          <Select
            value={settings.regulatoryFramework}
            label="Regulatory Framework"
            onChange={(e) =>
              handleChange("regulatoryFramework", e.target.value)
            }
            startAdornment={<Gavel sx={{ mr: 1 }} />}
            disabled={availableFrameworks.length === 0}
          >
            {availableFrameworks.map((framework) => (
              <MenuItem key={framework} value={framework}>
                {framework}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Selected Standards Summary */}
        <Box
          sx={{ p: 2, backgroundColor: "background.default", borderRadius: 1 }}
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            Active Compliance Configuration
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
            <Chip
              label={selectedCountry?.name || "No country selected"}
              color="primary"
              size="small"
              icon={<LocationOn />}
            />
            <Chip
              label={settings.region || "No region"}
              color="secondary"
              size="small"
              icon={<Business />}
            />
            {settings.regulatoryFramework && (
              <Chip
                label={settings.regulatoryFramework}
                color="info"
                size="small"
                icon={<Gavel />}
              />
            )}
          </Box>

          {settings.complianceStandards.length > 0 && (
            <Box>
              <Typography variant="caption" color="text.secondary" gutterBottom>
                Selected Standards:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {settings.complianceStandards.map((standard) => (
                  <Chip
                    key={standard}
                    label={standard}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Compliance Information */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <Info
              sx={{ fontSize: 16, mr: 0.5, verticalAlign: "text-bottom" }}
            />
            These settings affect report templates, audit checklists, and
            compliance monitoring features.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RegionalSettings;
