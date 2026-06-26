import { execSync } from 'child_process';
try {
  console.log("Restoring src/components/ClientDirectory.tsx...");
  const out = execSync("git checkout -- src/components/ClientDirectory.tsx", { encoding: 'utf-8' });
  console.log("Success:", out);
} catch (err) {
  console.error("Error executing git checkout:", err.message);
}
