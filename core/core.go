package core

import (
	"context"
	"sync"
)

// Version information
const Version = "1.0.0"

// Global variables for application lifecycle
var (
	Ctx     context.Context
	Cancel  context.CancelFunc
	StopAll func()

	// Exit callbacks
	exitCallbacks []func()
	exitMutex     sync.RWMutex
)

// Initialize context
func init() {
	Ctx, Cancel = context.WithCancel(context.Background())
	StopAll = Cancel
}

// AddExitCallback adds a callback to be called on application exit
func AddExitCallback(callback func()) {
	exitMutex.Lock()
	defer exitMutex.Unlock()
	exitCallbacks = append(exitCallbacks, callback)
}

// RunExitCalls runs all registered exit callbacks
func RunExitCalls() {
	exitMutex.RLock()
	callbacks := make([]func(), len(exitCallbacks))
	copy(callbacks, exitCallbacks)
	exitMutex.RUnlock()

	for _, callback := range callbacks {
		if callback != nil {
			callback()
		}
	}
}
