declare module 'prismjs/components/prism-core' {
  export const highlight: (text: string, grammar: any, language: string) => string;
  export const languages: {
    [key: string]: any;
    json: any;
    yaml: any;
  };
}
