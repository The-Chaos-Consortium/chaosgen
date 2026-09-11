const statusElement = document.querySelector<HTMLParagraphElement>(
  "#development-status",
);

if (statusElement === null) {
  throw new Error("Development status element is missing");
}

statusElement.textContent =
  "Foundation tooling is configured. Character generation is not implemented yet.";
