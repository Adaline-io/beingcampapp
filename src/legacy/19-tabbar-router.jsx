// BeingCamp — TabBar (unified) & Sheet router

function TabBar({ S }) {
  const tabs = [
    { id: 'home', icon: 'home', label: 'Home' },
    { id: 'showcase', icon: 'spark', label: 'Showcase' },
    { id: 'create', icon: 'plus', label: 'Create', center: true, sheet: true },
    { id: 'projects', icon: 'pool', label: 'Projects' },
    { id: 'profile', icon: 'user', label: 'You' },
  ];
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 90, paddingBottom: 26, background: 'linear-gradient(to top, var(--bg) 62%, rgba(10,10,10,0))' }}>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '10px 14px 12px', borderTop: '1px solid var(--line)', background: 'var(--bg-bar)', backdropFilter: 'blur(20px)' }}>
        {tabs.map((t) => {
          if (t.center) {
            const active = !t.sheet && S.tab === t.id;
            return (
              <button key={t.id} className="tap" onClick={() => t.sheet ? S.openSheet(t.id) : S.setTab(t.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, marginTop: -22 }}>
                <div style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(201,168,76,0.35), 0 0 0 5px var(--bg)', transform: active ? 'scale(1.04)' : 'scale(1)' }}>
                  <Icon name={t.icon} size={28} color="#1a1407" stroke={2.4} />
                </div>
                <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 10, fontWeight: 600, color: 'var(--gold)' }}>{t.label}</span>
              </button>
            );
          }
          const active = S.tab === t.id;
          return (
            <button key={t.id} className="tap" onClick={() => S.setTab(t.id)} style={{ cursor: 'pointer', background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, flex: 1, padding: '4px 0' }}>
              <Icon name={t.icon} size={24} color={active ? 'var(--gold)' : 'var(--dim)'} stroke={active ? 2.4 : 2} fill={active ? 'none' : 'none'} />
              <span style={{ fontFamily: 'Hanken Grotesk, sans-serif', fontSize: 10, fontWeight: active ? 700 : 500, color: active ? 'var(--gold)' : 'var(--dim)' }}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Routes a sheet name + payload to its component
function SheetRouter({ S }) {
  const { name, payload } = S.sheet;
  const close = S.closeSheet;
  const titles = { product: 'Product', booking: 'Book service', applyWork: 'Apply to join', postWork: 'Post work', gift: 'Gift BeingCoin', checkin: 'Zone check-in', pay: 'Checkout', publish: 'Publish', bookZone: 'Book a space', rsvp: 'Program', hostProgram: 'Host a program', create: 'Start something', editProfile: 'Edit profile' };
  return (
    <Sheet open={!!name} onClose={close} title={titles[name]} full={name === 'product' || name === 'applyWork' || name === 'postWork' || name === 'publish' || name === 'bookZone' || name === 'hostProgram' || name === 'editProfile'}>
      {name === 'product' && <ProductSheet S={S} product={payload.product} onClose={close} />}
      {name === 'booking' && <BookingSheet S={S} service={payload.service} onClose={close} />}
      {name === 'applyWork' && <ApplyWorkSheet S={S} work={payload.work} onClose={close} />}
      {name === 'postWork' && <PostWorkSheet S={S} onClose={close} />}
      {name === 'publish' && <PublishSheet S={S} onClose={close} />}
      {name === 'bookZone' && <BookZoneSheet S={S} workspaces={payload.workspaces} onClose={close} />}
      {name === 'rsvp' && <RsvpSheet S={S} workshop={payload.workshop} onClose={close} />}
      {name === 'hostProgram' && <HostProgramSheet S={S} onClose={close} />}
      {name === 'create' && <CreateSheet S={S} onClose={close} />}
      {name === 'gift' && <GiftSheet S={S} to={payload.to} onClose={close} />}
      {name === 'editProfile' && <EditProfileSheet S={S} onClose={close} />}
      {name === 'checkin' && <CheckinSheet S={S} zone={payload.zone} onClose={close} />}
      {name === 'pay' && <PaySheet S={S} pack={payload.pack} onClose={close} />}
    </Sheet>
  );
}

Object.assign(window, { TabBar, SheetRouter });
