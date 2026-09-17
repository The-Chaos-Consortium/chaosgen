/// <reference types="vite/client" />

declare module "*.pdf?url" {
  const url: string;
  export default url;
}
