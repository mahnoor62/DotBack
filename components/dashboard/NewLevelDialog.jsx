"use client";

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import AddIcon from "@mui/icons-material/Add";

const defaultFormState = {
  level: "",
  backgroundColor: "#f4f9ff",
  dot1Color: "#5ac8fa",
  dot2Color: "#8ad4ff",
  dot3Color: "#a8e6ff",
  dot4Color: "#c4f0ff",
  dot5Color: "#e2f8ff",
  logoUrl: "",
};

export default function NewLevelDialog({
  open,
  onClose,
  onCreate,
  isSubmitting,
}) {
  const [formValues, setFormValues] = useState(defaultFormState);
  const [error, setError] = useState(null);

  const resetAndClose = () => {
    setFormValues(defaultFormState);
    setError(null);
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);

    const levelNumber = Number(formValues.level);
    if (!Number.isInteger(levelNumber) || levelNumber < 1 || levelNumber > 10) {
      setError("Level must be an integer between 1 and 10.");
      return;
    }

    try {
      await onCreate({
        level: levelNumber,
        backgroundColor: formValues.backgroundColor,
        dot1Color: formValues.dot1Color,
        dot2Color: formValues.dot2Color,
        dot3Color: formValues.dot3Color,
        dot4Color: formValues.dot4Color,
        dot5Color: formValues.dot5Color,
        logoUrl: formValues.logoUrl,
      });
      resetAndClose();
    } catch (err) {
      setError(err.message || "Unable to create level.");
    }
  };

  return (
    <Dialog
      open={open}
      onClose={resetAndClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        component: "form",
        onSubmit: handleSubmit,
        sx: {
          borderRadius: 4,
          boxShadow: "0 28px 60px rgba(12,37,66,0.2)",
          background:
            "linear-gradient(135deg, rgba(246, 252, 255, 0.95), rgba(209, 232, 255, 0.65))",
        },
      }}
    >
      <DialogTitle>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(90,200,250,0.6), rgba(155,89,255,0.6))",
              color: "white",
              boxShadow: "0 12px 24px rgba(90,200,250,0.35)",
            }}
          >
            <AddIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Create a New Level
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Define the level identifier and its initial visual palette.
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2.5}>
          <TextField
            autoFocus
            type="number"
            label="Level Number"
            name="level"
            value={formValues.level}
            onChange={handleChange}
            required
            inputProps={{
              min: 1,
              max: 10,
            }}
            helperText="Enter an integer between 1 and 10."
          />

          <Typography variant="subtitle2" color="text.secondary">
            Optional: seed the level with your preferred palette now, or adjust
            after creation.
          </Typography>

          <Stack
            spacing={2}
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" },
              gap: 2,
            }}
          >
            <TextField
              label="Background Color"
              name="backgroundColor"
              value={formValues.backgroundColor}
              onChange={handleChange}
            />
            <TextField
              label="Dot 1 Color"
              name="dot1Color"
              value={formValues.dot1Color}
              onChange={handleChange}
            />
            <TextField
              label="Dot 2 Color"
              name="dot2Color"
              value={formValues.dot2Color}
              onChange={handleChange}
            />
            <TextField
              label="Dot 3 Color"
              name="dot3Color"
              value={formValues.dot3Color}
              onChange={handleChange}
            />
            <TextField
              label="Dot 4 Color"
              name="dot4Color"
              value={formValues.dot4Color}
              onChange={handleChange}
            />
            <TextField
              label="Dot 5 Color"
              name="dot5Color"
              value={formValues.dot5Color}
              onChange={handleChange}
            />
            <TextField
              label="Logo URL"
              name="logoUrl"
              value={formValues.logoUrl}
              onChange={handleChange}
              placeholder="Optional initial logo URL"
            />
          </Stack>

          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={resetAndClose} color="inherit">
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting}
          sx={{ px: 3, borderRadius: 3 }}
        >
          {isSubmitting ? "Creating..." : "Create Level"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

