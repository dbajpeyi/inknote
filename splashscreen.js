function animate(particles, delta, last)
{
    delta = Date.now() - last;
    last = Date.now();
    for (var i = 0; i < particles.length; i++)
    {
        var p = particles[i];
        p.x += Math.cos(p.angle) * 4 + Math.random() * 2 - Math.random() * 2;
        p.y += Math.sin(p.angle) * 4 + Math.random() * 2 - Math.random() * 2;
        p.life -= delta / 100;
        p.size -= delta / 200;
        
        if (p.size <= 0)
        {
            p.life = 0;
        }
        
        if (p.life <= 0)
        {
            particles.splice(i--, 1);
            continue;
        }
    }
}

function render(ctx, particles)
{
    ctx.fillStyle = "black";
    for (var i = 0; i < particles.length; i++)
    {
        if (Math.random() < 0.1)
        {
            continue;
        }
        var p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2, false);
        ctx.fill();
    }
}
