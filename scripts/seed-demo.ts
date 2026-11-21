if (process.env.NODE_ENV === "production") {
  throw new Error("Development demo seed refuses to run in production.");
}

console.log("No production demo records are seeded by this script. Add explicit development-only fixtures here when tests require them.");
