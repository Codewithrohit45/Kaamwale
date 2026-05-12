import { useState } from 'react';
import { FiSend, FiPaperclip, FiMoreVertical } from 'react-icons/fi';

export default function Messages() {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi, I need a plumbing repair. Are you available today?", sender: 'user', time: '10:30 AM' },
    { id: 2, text: "Hello! Yes, I can be there by 2 PM. What exactly is the issue?", sender: 'provider', time: '10:35 AM' },
    { id: 3, text: "The kitchen sink pipe is leaking.", sender: 'user', time: '10:36 AM' },
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages([...messages, { id: Date.now(), text: input, sender: 'user', time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }]);
    setInput('');
  };

  return (
    <div className="h-[calc(100vh-140px)] flex bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r border-slate-100 dark:border-slate-700 hidden md:flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {[1, 2, 3].map(item => (
            <div key={item} className={`p-4 border-b border-slate-50 dark:border-slate-700/50 cursor-pointer transition-colors ${item === 1 ? 'bg-teal-50 dark:bg-teal-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
              <div className="flex gap-3">
                <img src="https://ui-avatars.com/api/?name=Suresh+P" className="w-12 h-12 rounded-full" alt="" />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white truncate">Suresh Plumbing</h3>
                    <span className="text-xs text-slate-400">10:36 AM</span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">The kitchen sink pipe is leaking.</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-white dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <img src="https://ui-avatars.com/api/?name=Suresh+P" className="w-10 h-10 rounded-full" alt="" />
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white">Suresh Plumbing</h3>
              <p className="text-xs text-teal-600 dark:text-teal-400">Online</p>
            </div>
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <FiMoreVertical size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 dark:bg-slate-900 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-2xl p-3 ${msg.sender === 'user' ? 'bg-teal-600 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-white rounded-tl-sm'}`}>
                <p className="text-sm">{msg.text}</p>
                <p className={`text-[10px] mt-1 text-right ${msg.sender === 'user' ? 'text-teal-200' : 'text-slate-400'}`}>{msg.time}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <button type="button" className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <FiPaperclip size={20} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..." 
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
            />
            <button type="submit" className="p-2 bg-teal-600 text-white rounded-full hover:bg-teal-700 transition-colors flex items-center justify-center w-10 h-10">
              <FiSend />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
