package entry

import (
	"flag"
	"fmt"
	"os"
	"os/signal"
	"strings"
	"syscall"

	"github.com/isymbo/sachi/config"
	"github.com/isymbo/sachi/core"
	"github.com/isymbo/sachi/web"
)

func RunCmd() {
	defer func() {
		if r := recover(); r != nil {
			if err, ok := r.(error); ok {
				fmt.Printf("sachi panic: %v\n", err)
			} else {
				fmt.Printf("sachi panic: %v\n", r)
			}
			core.RunExitCalls()
			os.Exit(1)
		} else {
			core.RunExitCalls()
		}
	}()

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGINT, syscall.SIGTERM)

	// Wait for signal in goroutine
	go func() {
		<-sigChan
		if core.StopAll != nil {
			core.StopAll()
		}
		core.RunExitCalls()
		os.Exit(0)
	}()

	args := os.Args[1:]
	if len(args) == 0 {
		runWeb(args)
		return
	}

	name := args[0]
	if strings.HasPrefix(name, "-") {
		if name == "-h" || name == "--help" {
			printMainHelp()
		} else {
			runWeb(args)
		}
		return
	}

	// Handle commands
	switch name {
	case "web":
		runWeb(args[1:])
	case "version":
		fmt.Printf("Sachi version %s\n", core.Version)
	default:
		fmt.Printf("Unknown command: %s\n", name)
		printMainHelp()
	}
}

func printMainHelp() {
	fmt.Printf(`
Sachi %s - AI-Powered Analytics Platform

Usage:
  sachi [command] [flags]

Available Commands:
  web       Start web server (default)
  version   Show version information
  help      Show this help message

Flags:
  -h, --help     Show help
  
Use "sachi [command] --help" for more information about a command.
`, core.Version)
}

func runWeb(args []string) {
	var cmdArgs = &config.CmdArgs{}
	var f = flag.NewFlagSet("web", flag.ExitOnError)
	f.IntVar(&cmdArgs.Port, "port", 8000, "port to listen")
	f.StringVar(&cmdArgs.Host, "host", "0.0.0.0", "bind host ip")
	f.StringVar(&cmdArgs.LogLevel, "level", "info", "log level")
	f.StringVar(&cmdArgs.DataDir, "datadir", "", "Path to data dir.")
	f.StringVar(&cmdArgs.DBFile, "db", "sachi.db", "db file path")

	if args == nil {
		args = []string{}
	}
	err := f.Parse(args)
	if err != nil {
		fmt.Printf("Error parsing flags: %v\n", err)
		return
	}

	// Initialize configuration
	err = config.Init(cmdArgs)
	if err != nil {
		fmt.Printf("Error initializing config: %v\n", err)
		return
	}

	// Start web server
	err = web.RunDev(cmdArgs)
	if err != nil {
		fmt.Printf("Error starting web server: %v\n", err)
		return
	}
}
