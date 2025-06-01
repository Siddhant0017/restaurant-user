
import { useState, useRef, useEffect } from "react"
import { X } from "lucide-react"
import "./CookingInstruction.css"

const CookingInstruction = ({ isOpen, onClose, onSave, initialValue = "" }) => {
  const [instructions, setInstructions] = useState(initialValue)
  const textareaRef = useRef(null)

  useEffect(() => {
    if (isOpen) {
      setInstructions(initialValue)
      // Auto-focus textarea to open mobile keyboard
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus()
          textareaRef.current.click()
        }
      }, 300) // Small delay to ensure modal is fully rendered
    }
  }, [isOpen, initialValue])

  if (!isOpen) return null

  const handleSave = () => {
    onSave(instructions)
    onClose()
  }

  const handleCancel = () => {
    setInstructions(initialValue)
    onClose()
  }

  return (
    <div className="cooking-instruction-overlay">
      <div className="cooking-instruction-modal">
        {/* Header with close button */}
        <div className="cooking-instruction-header">
          <h2 className="cooking-instruction-title">Add Cooking instructions</h2>
          <button className="cooking-instruction-close-btn" onClick={onClose}>
            <X size={24} color="white" />
          </button>
        </div>

        {/* Main content */}
        <div className="cooking-instruction-content">
          <div className="cooking-instruction-textarea-container">
            <div className="cooking-instruction-textarea-shadow"></div>
            <textarea
              ref={textareaRef}
              className="cooking-instruction-textarea"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter your cooking instructions here..."
              rows={6}
              autoFocus
            />
          </div>

          <p className="cooking-instruction-disclaimer">
            The restaurant will try its best to follow your request. However, refunds or cancellations in this regard
            won't be possible
          </p>
        </div>

        {/* Action buttons */}
        <div className="cooking-instruction-actions">
          <button className="cooking-instruction-cancel-btn" onClick={handleCancel}>
            Cancel
          </button>
          <button className="cooking-instruction-next-btn" onClick={handleSave}>
            Next
          </button>
        </div>
      </div>
    </div>
  )
}

export default CookingInstruction;