package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

type FormData struct {
	Event string `json:"event"`
	Data  Data   `json:"data"`
}

type Data struct {
	WebsiteUrl         string          `json:"website_url"`
	SessionId          string          `json:"session_id"`
	ResizeFrom         Dimension       `json:"resize_from"`
	ResizeTo           Dimension       `json:"resize_to"`
	CopyAndPaste       map[string]bool `json:"copy_and_paste"`       // map[fieldId]true
	FormCompletionTime int             `json:"form_completion_time"` // milliseconds
}

type Dimension struct {
	Width  int `json:"width"`
	Height int `json:"height"`
}

var sessions = map[string]*Data{}

func main() {
	http.HandleFunc("/update", updateHandler)

	http.Handle("/", http.FileServer(http.Dir("./public")))
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func updateHandler(w http.ResponseWriter, r *http.Request) {
	var fd FormData
	dec := json.NewDecoder(r.Body)
	err := dec.Decode(&fd)
	if err != nil {
		w.WriteHeader(http.StatusUnprocessableEntity)
		return
	}

	d, ok := sessions[fd.Data.SessionId]
	if !ok {
		d = &Data{
			WebsiteUrl: fd.Data.WebsiteUrl,
			SessionId:  fd.Data.SessionId}
		sessions[fd.Data.SessionId] = d
	}

	switch fd.Event {
	case "resize":
		fmt.Printf("RESIZE: \n	%+v\n", d)
		d.ResizeFrom = fd.Data.ResizeFrom
		d.ResizeTo = fd.Data.ResizeTo
	case "paste":
		fmt.Printf("PASTE: \n	%+v\n", d)
		if d.CopyAndPaste == nil {
			d.CopyAndPaste = map[string]bool{}
		}

		for k, v := range fd.Data.CopyAndPaste {
			d.CopyAndPaste[k] = v
		}
	case "submit":
		d.FormCompletionTime = fd.Data.FormCompletionTime
		fmt.Printf("SUBMIT: \n	%+v\n", d)
	}

}
