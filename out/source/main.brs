function RunUserInterface(params)
    date = createObject("roDateTime")
    console.log("App Start Time: " + date.toISOString() + "")
    showScene(params)
end function
function showScene(params)
    console.log(params)
    m.screen = createObject("roSGScreen")
    m.port = createObject("roMessagePort")
    m.screen.setMessagePort(m.port)
    scene = m.screen.createScene("MyScene")
    m.screen.show()
    while true
        msg = wait(0, m.port)
        msgType = type(msg)
        if msgType = "roSGScreenEvent" then
            if msg.isScreenClosed() then
                console.log("Closing app")

            end if

        end if
    end while
end function