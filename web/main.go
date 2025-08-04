package web

import (
	"github.com/isymbo/sachi/config"
	"github.com/isymbo/sachi/web/dev"
)

// RunDev starts the development web server
func RunDev(args *config.CmdArgs) error {
	return dev.Run(args)
}
