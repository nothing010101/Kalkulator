'use client'

import { useState, useEffect } from 'react'

export default function BTCCalculator() {
  const [balance, setBalance] = useState(10000)
  const [currency, setCurrency] = useState('USD')
  const [riskPercent, setRiskPercent] = useState(2)
  const [position, setPosition] = useState('SHORT')
  const [currentPrice, setCurrentPrice] = useState(105881)
  const [priceChange24h, setPriceChange24h] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isOnline, setIsOnline] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  
  // State baru untuk lot manual
  const [lotMode, setLotMode] = useState('auto') // 'auto' atau 'manual'
  const [manualLot, setManualLot] = useState(0.05)
  
  const leverage = 1000
  
  const fetchPrice = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT')
      const data = await response.json()
      setCurrentPrice(parseFloat(data.lastPrice))
      setPriceChange24h(parseFloat(data.priceChangePercent))
      setIsOnline(true)
      setLastUpdate(new Date())
    } catch (error) {
      console.error('Error:', error)
      setIsOnline(false)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchPrice()
    const interval = setInterval(fetchPrice, 5000)
    return () => clearInterval(interval)
  }, [])

  const shortEntry = Math.round(currentPrice * 0.9997)
  const shortSL = Math.round(currentPrice * 1.004)
  const shortTP1 = Math.round(currentPrice * 0.995)
  const shortTP2 = Math.round(currentPrice * 0.991)
  const shortTP3 = Math.round(currentPrice * 0.988)
  
  const longEntry = Math.round(currentPrice * 0.995)
  const longSL = Math.round(currentPrice * 0.991)
  const longTP1 = Math.round(currentPrice * 0.9997)
  const longTP2 = Math.round(currentPrice * 1.003)
  const longTP3 = Math.round(currentPrice * 1.007)
  
  const balanceUSD = currency === 'IDR' ? balance / 16700 : balance
  const riskAmount = balanceUSD * (riskPercent / 100)
  
  let entry, sl, tp1, tp2, tp3, slDistance
  
  if (position === 'SHORT') {
    entry = shortEntry
    sl = shortSL
    tp1 = shortTP1
    tp2 = shortTP2
    tp3 = shortTP3
    slDistance = sl - entry
  } else {
    entry = longEntry
    sl = longSL
    tp1 = longTP1
    tp2 = longTP2
    tp3 = longTP3
    slDistance = entry - sl
  }
  
  // Perhitungan lot - auto atau manual
  const autoLotSize = (riskAmount / slDistance).toFixed(3)
  const lotSize = lotMode === 'manual' ? manualLot.toFixed(3) : autoLotSize
  
  const positionValue = entry * parseFloat(lotSize)
  const marginRequired = positionValue / leverage
  const actualRisk = slDistance * parseFloat(lotSize)
  
  const profit1 = Math.abs(tp1 - entry) * parseFloat(lotSize)
  const profit2 = Math.abs(tp2 - entry) * parseFloat(lotSize)
  const profit3 = Math.abs(tp3 - entry) * parseFloat(lotSize)
  
  const rr1 = (profit1 / actualRisk).toFixed(2)
  const rr2 = (profit2 / actualRisk).toFixed(2)
  const rr3 = (profit3 / actualRisk).toFixed(2)
  
  const formatCurrency = (val) => {
    if (currency === 'IDR') {
      return `Rp ${(val * 16700).toLocaleString('id-ID', {maximumFractionDigits: 0})}`
    }
    return `$${val.toLocaleString('en-US', {maximumFractionDigits: 2})}`
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-4">
      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: system-ui, -apple-system, sans-serif; }
        input[type="range"] {
          -webkit-appearance: none;
          width: 100%;
          height: 12px;
          border-radius: 6px;
          background: #334155;
          outline: none;
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
        }
        input[type="range"]::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: none;
        }
        input[type="number"] {
          -moz-appearance: textfield;
        }
        input[type="number"]::-webkit-inner-spin-button,
        input[type="number"]::-webkit-outer-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-6 shadow-2xl">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h1 className="text-3xl font-bold">BTCUSDT Calculator</h1>
              <p className="text-blue-100">MT5 - Leverage 1:1000 - Live Data</p>
            </div>
            <button 
              onClick={fetchPrice}
              disabled={isLoading}
              className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
            >
              {isLoading ? '⏳' : '🔄'}
            </button>
          </div>
          
          <div className="bg-white/10 backdrop-blur rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Live Price:</span>
              <div className="text-right">
                <div className="text-3xl font-bold">
                  ${currentPrice.toLocaleString('en-US', {minimumFractionDigits: 2})}
                </div>
                <div className={`text-sm ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {priceChange24h >= 0 ? '↑' : '↓'} {Math.abs(priceChange24h).toFixed(2)}% (24h)
                </div>
              </div>
            </div>
            <div className="flex justify-between text-xs text-blue-200">
              <span>{isOnline ? '🟢 Online' : '🔴 Offline'}</span>
              <span>Updated: {formatTime(lastUpdate)}</span>
            </div>
          </div>
        </div>

        {/* Input Balance */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
            <label className="block text-sm font-medium mb-2">Balance Trading</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-700 rounded-lg px-4 py-3 text-lg font-semibold outline-none"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => setCurrency('USD')}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  currency === 'USD' ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                USD ($)
              </button>
              <button
                onClick={() => setCurrency('IDR')}
                className={`flex-1 py-2 rounded-lg font-medium transition ${
                  currency === 'IDR' ? 'bg-blue-600' : 'bg-slate-700'
                }`}
              >
                IDR (Rp)
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
            <label className="block text-sm font-medium mb-2">Risk: {riskPercent}%</label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              value={riskPercent}
              onChange={(e) => setRiskPercent(parseFloat(e.target.value))}
            />
            <div className="flex justify-between text-xs text-slate-400 mt-2">
              <span>0.5%</span>
              <span>5%</span>
            </div>
            <div className="mt-4 bg-slate-700 rounded-lg p-3">
              <div className="text-sm text-slate-400">
                {lotMode === 'manual' ? 'Actual Risk' : 'Risk Amount'}
              </div>
              <div className="text-xl font-bold text-red-400">
                {formatCurrency(lotMode === 'manual' ? actualRisk : riskAmount)}
              </div>
            </div>
          </div>
        </div>

        {/* LOT SIZE CONTROL - FITUR BARU */}
        <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-xl p-6 mb-6 shadow-xl">
          <label className="block text-sm font-medium mb-3">⚙️ Lot Size Control</label>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <button
              onClick={() => setLotMode('auto')}
              className={`py-3 rounded-xl font-bold transition ${
                lotMode === 'auto'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/20 text-white'
              }`}
            >
              🤖 Auto Calculate
            </button>
            <button
              onClick={() => setLotMode('manual')}
              className={`py-3 rounded-xl font-bold transition ${
                lotMode === 'manual'
                  ? 'bg-white text-orange-600'
                  : 'bg-white/20 text-white'
              }`}
            >
              ✏️ Manual Input
            </button>
          </div>

          {lotMode === 'manual' && (
            <div className="bg-white/10 rounded-lg p-4">
              <label className="block text-sm mb-2">Enter Your Lot Size:</label>
              <input
                type="number"
                step="0.01"
                value={manualLot}
                onChange={(e) => setManualLot(parseFloat(e.target.value) || 0.01)}
                className="w-full bg-slate-700 rounded-lg px-4 py-3 text-2xl font-bold text-center outline-none"
                placeholder="0.05"
              />
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => setManualLot(0.01)}
                  className="flex-1 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600"
                >
                  0.01
                </button>
                <button
                  onClick={() => setManualLot(0.05)}
                  className="flex-1 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600"
                >
                  0.05
                </button>
                <button
                  onClick={() => setManualLot(0.10)}
                  className="flex-1 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600"
                >
                  0.10
                </button>
                <button
                  onClick={() => setManualLot(0.50)}
                  className="flex-1 py-2 bg-slate-700 rounded-lg text-sm hover:bg-slate-600"
                >
                  0.50
                </button>
              </div>
            </div>
          )}

          {lotMode === 'auto' && (
            <div className="bg-white/10 rounded-lg p-4 text-center">
              <div className="text-sm text-white/70 mb-2">Recommended Lot Size:</div>
              <div className="text-3xl font-bold text-yellow-300">{autoLotSize} BTC</div>
              <div className="text-xs text-white/60 mt-2">Based on {riskPercent}% risk</div>
            </div>
          )}
        </div>

        {/* Position Type */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-xl">
          <label className="block text-sm font-medium mb-3">Position Type</label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setPosition('SHORT')}
              className={`py-4 rounded-xl font-bold text-lg transition ${
                position === 'SHORT'
                  ? 'bg-gradient-to-r from-red-600 to-red-500'
                  : 'bg-slate-700'
              }`}
            >
              📉 SHORT
            </button>
            <button
              onClick={() => setPosition('LONG')}
              className={`py-4 rounded-xl font-bold text-lg transition ${
                position === 'LONG'
                  ? 'bg-gradient-to-r from-green-600 to-green-500'
                  : 'bg-slate-700'
              }`}
            >
              📈 LONG
            </button>
          </div>
        </div>

        {/* Results */}
        <div className="bg-slate-800 rounded-xl p-6 mb-6 shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">💰 Calculation Results</h2>
          
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400">Lot Size</div>
              <div className="text-2xl font-bold text-yellow-400">{lotSize}</div>
              {lotMode === 'manual' && (
                <div className="text-xs text-yellow-300 mt-1">Manual</div>
              )}
            </div>
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400">Position</div>
              <div className="text-xl font-bold">${(positionValue/1000).toFixed(1)}k</div>
            </div>
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <div className="text-sm text-slate-400">Margin</div>
              <div className="text-xl font-bold text-green-400">${marginRequired.toFixed(0)}</div>
            </div>
          </div>

          {/* Order Details */}
          <div className={`rounded-lg p-4 mb-4 ${
            position === 'SHORT' ? 'bg-red-900/30' : 'bg-green-900/30'
          }`}>
            <h3 className="font-bold mb-3">📝 MT5 Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="font-bold">{position}</span>
              </div>
              <div className="flex justify-between">
                <span>Entry:</span>
                <span className="font-bold">${entry.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Stop Loss:</span>
                <span className="font-bold text-red-400">${sl.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Volume:</span>
                <span className="font-bold text-yellow-400">{lotSize} lot</span>
              </div>
              <div className="flex justify-between">
                <span>Max Loss:</span>
                <span className="font-bold text-red-400">{formatCurrency(actualRisk)}</span>
              </div>
            </div>
          </div>

          {/* Take Profits */}
          <div className="space-y-3">
            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-green-400">🎯 TP1 (30%)</span>
                <span>${tp1.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <div className="text-xl font-bold text-green-400">+{formatCurrency(profit1)}</div>
                <div className="text-sm text-slate-400">RR 1:{rr1}</div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-green-400">🎯 TP2 (40%)</span>
                <span>${tp2.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <div className="text-xl font-bold text-green-400">+{formatCurrency(profit2)}</div>
                <div className="text-sm text-slate-400">RR 1:{rr2}</div>
              </div>
            </div>

            <div className="bg-green-900/20 border border-green-600/30 rounded-lg p-4">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-green-400">🎯 TP3 (30%)</span>
                <span>${tp3.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <div className="text-xl font-bold text-green-400">+{formatCurrency(profit3)}</div>
                <div className="text-sm text-slate-400">RR 1:{rr3}</div>
              </div>
            </div>
          </div>

          {/* Total */}
          <div className="mt-4 bg-purple-900/30 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">💎 Total Potential</span>
              <div className="text-2xl font-bold text-yellow-400">
                +{formatCurrency(profit1 * 0.3 + profit2 * 0.4 + profit3 * 0.3)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-xl p-4 text-sm text-yellow-100 mb-4">
          ⚠️ <strong>Warning:</strong> Gunakan Stop Loss. Data update otomatis setiap 5 detik. Trading berisiko tinggi.
        </div>

        <div className="text-center text-slate-400 text-sm pb-4">
          Made with ❤️ for MT5 Traders | {lotMode === 'manual' ? 'Manual Lot Mode' : 'Auto Calculate Mode'}
        </div>
      </div>
    </div>
  )
}
