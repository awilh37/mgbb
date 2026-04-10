const canvas = document.querySelector("canvas")
const c = canvas.getContext("2d")

bgcolor = "white"

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const keys = {
    d: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    w: {
        pressed: false,
    },
    s: {
        pressed: false
    }
}

const MAX_SPEED = 20
const ACCELERATION = 2
const FRICTION = 0.25

class Player {
    constructor(
        position,
        velocity,
        health = 100,
        color = "green",
        width = 50,
        height = 50
    ) {
        this.position = position
        this.velocity = velocity
        this.health = health
        this.color = color
        this.width = width
        this.height = height
    }

    draw() {
        c.fillStyle = this.color
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
        c.fillStyle = "red"
        c.fillRect(this.position.x, this.position.y - 10, this.width * (this.health / 100), 5)
    }

    update(dt) {
        this.position.x += this.velocity.x * dt
        this.position.y += this.velocity.y * dt
    }
}

class Projectile {
    constructor(
        position,
        velocity,
        damage,
        radius
    ) {
        this.position = position
        this.velocity = velocity
        this.damage = damage
        this.radius = radius
    }

    draw() {
        c.fillStyle = "black"
        c.beginPath()
        c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2)
        c.fill()
    }

    update(dt) {
        this.position.x += this.velocity.x * dt
        this.position.y += this.velocity.y * dt
    }
}

const player = new Player({ x: canvas.width / 2, y: canvas.height / 2 }, { x: 0, y: 0 })

const projectiles = []

function clampVelocityMagnitude(velocity, maxSpeed) {
    const magnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
    if (magnitude > maxSpeed) {
        velocity.x = (velocity.x / magnitude) * maxSpeed
        velocity.y = (velocity.y / magnitude) * maxSpeed
    }
}

function applyFriction(velocity, frictionAmount) {
    const magnitude = Math.sqrt(velocity.x ** 2 + velocity.y ** 2)
    if (magnitude > 0) {
        const newMagnitude = Math.max(0, magnitude - frictionAmount)
        if (magnitude > 0) {
            velocity.x = (velocity.x / magnitude) * newMagnitude
            velocity.y = (velocity.y / magnitude) * newMagnitude
        }
    }
}

let lastTime = 0

function animate(currentTime) {
    const deltaTime = Math.min(currentTime - lastTime, 100) / 16.6667
    lastTime = currentTime

    requestAnimationFrame(animate)
    c.fillStyle = bgcolor
    c.fillRect(0, 0, canvas.width, canvas.height)

    const axisX = keys.d.pressed ? 1 : keys.a.pressed ? -1 : 0
    const axisY = keys.s.pressed ? 1 : keys.w.pressed ? -1 : 0
    const dirMag = Math.hypot(axisX, axisY)

    if (dirMag > 0) {
        player.velocity.x += (ACCELERATION * deltaTime) * axisX / dirMag
        player.velocity.y += (ACCELERATION * deltaTime) * axisY / dirMag
    }

    clampVelocityMagnitude(player.velocity, MAX_SPEED)
    applyFriction(player.velocity, FRICTION * deltaTime)

    player.update(deltaTime)

    if (player.position.x < 0) {
        player.position.x = 0
        player.velocity.x *= -1
    }
    if (player.position.x > canvas.width - player.width) {
        player.position.x = canvas.width - player.width
        player.velocity.x *= -1
    }
    if (player.position.y < 0) {
        player.position.y = 0
        player.velocity.y *= -1
    }
    if (player.position.y > canvas.height - player.height) {
        player.position.y = canvas.height - player.height
        player.velocity.y *= -1
    }

    player.draw()

    // test to make sure the projectile speed is normalized if they are fired at an angle relative to an axis
    // CURRENTLY NOT NORMALIZED, PLEASE FIX
    // projectiles.push(projectile = new Projectile(
    //     { x: player.position.x + (player.width / 2), y: player.position.y + (player.height / 2) },
    //     { x: 10, y: 0 },
    //     10,
    //     5
    // ))
    // projectiles.push(projectile = new Projectile(
    //     { x: player.position.x + (player.width / 2), y: player.position.y + (player.height / 2) },
    //     { x: 10, y: 10 },
    //     10,
    //     5
    // ))


    for (let i = 0; i < projectiles.length; i++) {
        const projectile = projectiles[i]
        projectile.update(deltaTime)
        projectile.draw()
    }
}

animate(0)

window.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = true
            break
        case 'a':
            keys.a.pressed = true
            break
        case 'w':
            keys.w.pressed = true
            break
        case 's':
            keys.s.pressed = true
            break
    }
}
)

window.addEventListener('keyup', (event) => {
    switch (event.key) {
        case 'd':
            keys.d.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 'w':
            keys.w.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
    }
})

addEventListener('click', (event) => {
    console.log(`click`)
    const angle = Math.atan2(
        event.clientY - player.position.y + (player.height / 2),
        event.clientX - player.position.x + (player.width / 2)
    )

    const distance = Math.sqrt(
        Math.hypot(event.clientX - player.position.x, event.clientY - player.position.y)
    )

    console.log(`angle: ${angle * (180 / Math.PI)} degrees`)
    const velocity = {
        x: (Math.cos(angle) * (4 * Math.log(distance + 1) + 2)) + player.velocity.x,
        y: (Math.sin(angle) * (4 * Math.log(distance + 1) + 2)) + player.velocity.y
    }

    console.log(`velocity: (${velocity.x}, ${velocity.y})`)
    projectiles.push(projectile = new Projectile(
        { x: player.position.x + (player.width / 2), y: player.position.y + (player.height / 2) },
        velocity,
        10,
        5
    ))
})