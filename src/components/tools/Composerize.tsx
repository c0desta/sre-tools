import React, { useState, useEffect } from 'react';
import minimist from 'minimist';
import yaml from 'js-yaml';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-yaml';
import 'prismjs/themes/prism-tomorrow.css';

const Composerize: React.FC = () => {
  const [dockerCommand, setDockerCommand] = useState('');
  const [composeYaml, setComposeYaml] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dockerCommand.trim().toLowerCase().startsWith('docker run')) {
      try {
        // A simple regex to split arguments while respecting quotes
        const argv = dockerCommand.match(/(?:[^\s"']+|"[^"]*"|'[^']*')+/g) || [];
        
        // Remove "docker" and "run"
        const args = minimist(argv.slice(2));

        if (args._.length === 0) {
          setError('Please provide an image name.');
          setComposeYaml('');
          return;
        }

        const service: any = {};
        const imageName = args._[0];
        const serviceName = args.name || (imageName.includes('/') ? imageName.split('/').pop()?.split(':')[0] : imageName.split(':')[0]) || 'myservice';

        service.image = imageName;

        if (args.name) {
          service.container_name = args.name;
        }

        const ports = [].concat(args.p || [], args.publish || []);
        if (ports.length > 0) {
          service.ports = ports.map(String);
        }

        const volumes = [].concat(args.v || [], args.volume || []);
        if (volumes.length > 0) {
          service.volumes = volumes.map(String);
        }

        const envs = [].concat(args.e || [], args.env || []);
        if (envs.length > 0) {
          service.environment = envs.map(String);
        }

        if (args.restart) {
          service.restart = String(args.restart);
        }

        if (args._.length > 1) {
          service.command = args._.slice(1).join(' ');
        }

        const composeObject = {
          version: '3.8',
          services: {
            [serviceName]: service,
          },
        };

        setComposeYaml(yaml.dump(composeObject));
        setError(null);
      } catch (e: any) {
        setError('Invalid Docker command: ' + e.message);
        setComposeYaml('');
      }
    } else {
      setComposeYaml('');
      setError(dockerCommand.trim() === '' ? null : 'Command must start with "docker run"');
    }
  }, [dockerCommand]);

  const handleCopy = () => {
    navigator.clipboard.writeText(composeYaml);
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-gray-100">Composerize: Docker Run to Compose</h1>
      <div className="space-y-8">
        <div>
          <label className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-300 block">Docker Run Command</label>
          <textarea
            value={dockerCommand}
            onChange={(e) => setDockerCommand(e.target.value)}
            placeholder="Paste your 'docker run' command here..."
            className="w-full h-32 p-3 font-mono text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200 rounded-md focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="text-xl font-semibold text-gray-700 dark:text-gray-300">docker-compose.yml</label>
            <button
              onClick={handleCopy}
              disabled={!composeYaml}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 dark:hover:bg-indigo-500 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition"
            >
              Copy YAML
            </button>
          </div>
          <div className="bg-gray-900 rounded-md overflow-hidden">
            <Editor
              value={composeYaml}
              onValueChange={() => {}}
              highlight={(code) => Prism.highlight(code, Prism.languages.yaml, 'yaml')}
              padding={10}
              readOnly
              style={{
                fontFamily: '"Fira code", "Fira Mono", monospace',
                fontSize: 14,
                minHeight: '200px',
                color: '#d1d5db', // Tailwind gray-300 for better contrast
              }}
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-lg shadow-lg" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Composerize;
