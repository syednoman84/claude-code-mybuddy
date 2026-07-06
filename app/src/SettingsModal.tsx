import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Config, DEFAULT_MODELS } from './types';

interface Props {
  config: Config;
  onSave: (c: Config) => void;
  onClose: () => void;
}

export function SettingsModal({ config, onSave, onClose }: Props) {
  const [draft, setDraft] = useState<Config>(config);
  const [customModel, setCustomModel] = useState('');

  const knownIds = DEFAULT_MODELS.map((m) => m.id);
  const isCustom = !knownIds.includes(draft.model);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(draft);
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <label>
            LiteLLM Proxy URL
            <input
              type="url"
              value={draft.baseUrl}
              onChange={(e) => setDraft({ ...draft, baseUrl: e.target.value })}
              placeholder="https://llm.example.com"
              required
            />
          </label>

          <label>
            Auth Token (Proxy Key)
            <input
              type="password"
              value={draft.authToken}
              onChange={(e) => setDraft({ ...draft, authToken: e.target.value })}
              placeholder="sk-..."
              required
            />
          </label>

          <label>
            Model
            <select
              value={isCustom ? '__custom__' : draft.model}
              onChange={(e) => {
                if (e.target.value === '__custom__') {
                  setDraft({ ...draft, model: customModel });
                } else {
                  setDraft({ ...draft, model: e.target.value });
                }
              }}
            >
              {DEFAULT_MODELS.map((m) => (
                <option key={m.id} value={m.id}>{m.label}</option>
              ))}
              <option value="__custom__">Custom model ID…</option>
            </select>
          </label>

          {(isCustom || draft.model === customModel) && (
            <label>
              Custom Model ID
              <input
                type="text"
                value={isCustom ? draft.model : customModel}
                onChange={(e) => {
                  setCustomModel(e.target.value);
                  setDraft({ ...draft, model: e.target.value });
                }}
                placeholder="provider/model-name"
              />
            </label>
          )}

          <label>
            System Prompt
            <textarea
              value={draft.systemPrompt}
              onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
              rows={3}
              placeholder="You are a helpful assistant."
            />
          </label>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
}
