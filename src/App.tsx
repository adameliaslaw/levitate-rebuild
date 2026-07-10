import React, { useState, useMemo, useRef } from "react";
import {
  LayoutDashboard,
  Users,
  Megaphone,
  CalendarDays,
  Workflow,
  Inbox,
  Video,
  Star,
  BarChart3,
  Settings2,
  Search,
  Sparkles,
  Plus,
  Table as TableIcon,
  LayoutGrid,
  Tag,
  Clock,
  Mail,
  Phone,
  MoreHorizontal,
  ChevronRight,
  X,
  Send,
  Eye,
  MessageSquare,
  Heart,
  ArrowUpRight,
  Calendar,
  Zap,
  Globe,
  FileText,
  Gift,
  Repeat,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Languages,
  Lightbulb,
  Copy,
  ExternalLink,
  GripVertical,
} from "lucide-react";

// Types
type KeyFact = { id: string; label: string; value: string; type: "date" | "info" };
type Note = { id: string; text: string; at: string; author: string };
type ActionItem = { id: string; title: string; due: string; assignee: string; isPrivate: boolean };
type Contact = {
  id: string;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  tags: string[];
  owner: string;
  lastContacted: string;
  keepInterval: number;
  birthday: string;
  renewal: string;
  keyFacts: KeyFact[];
  notes: Note[];
  actionItems: ActionItem[];
  color: string;
  connections: number;
  happiness: number;
};

type Template = {
  id: string;
  title: string;
  category: string;
  subject: string;
  body: string;
  social: string;
  gradient: string;
  icon: string;
};

type Automation = {
  id: string;
  name: string;
  trigger: string;
  triggerDetail: string;
  active: boolean;
  enrolled: number;
  steps: { type: string; label: string; delay?: string }[];
  performance: { sent: number; open: number; reply: number };
};

// Seed
const owners = ["You", "Maya Chen", "Jordan Lee"];
const tagPool = ["VIP", "Personal Lines", "Commercial", "Referral Partner", "New Lead", "Renewal Due", "At Risk", "Family"];

const contactsSeed: Contact[] = Array.from({ length: 24 }).map((_, i) => {
  const first = ["Ava","Liam","Sofia","Noah","Isabella","Mason","Mia","Ethan","Charlotte","James","Amelia","Oliver","Harper","Lucas","Evelyn","Henry","Abigail","Alexander","Emily","Daniel","Luna","Michael","Grace","Benjamin"][i];
  const last = ["Rivera","Kim","Patel","Okafor","Garcia","Smith","Nguyen","Brown","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Martinez","Robinson","Clark","Lewis","Walker"][i];
  const company = ["Rivera Homes","Kim Consulting","Patel Family","Okafor & Co","Garcia Insurance","Smith Properties","Nguyen Auto","Brown Bakery","Davis Law","Wilson Roofing"][i%10];
  const lastContactedDays = [2, 12, 35, 42, 5, 88, 14, 29, 61, 3, 19, 74, 8, 31, 90, 11, 27, 55, 6, 40, 18, 66, 9, 22][i];
  const keep = [30,30,60,30,90,30,60,30,30,7,60,30,30,90,30,30,60,30,7,60,30,30,30,90][i];
  const d = new Date(); d.setDate(d.getDate()-lastContactedDays);
  return {
    id: `c${i+1}`,
    firstName: first,
    lastName: last,
    company,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@${company.split(" ")[0].toLowerCase()}.com`,
    phone: `(${555 + i}) 010-${1000+i}`,
    tags: [tagPool[i%tagPool.length], ...(i%3===0?[tagPool[(i+2)%tagPool.length]]:[])],
    owner: owners[i%3],
    lastContacted: d.toISOString().slice(0,10),
    keepInterval: keep,
    birthday: `2025-${String((i%12)+1).padStart(2,"0")}-${String(5+(i%20)).padStart(2,"0")}`,
    renewal: `2025-${String(((i+2)%12)+1).padStart(2,"0")}-15`,
    keyFacts: [
      { id: "kf1", label: "Kids", value: i%2===0 ? "2 kids - soccer & piano" : "Dog named Maple", type: "info" },
      { id: "kf2", label: "Anniversary", value: "June 12", type: "date" },
    ],
    notes: [{ id: "n1", text: `Great chat about ${company} renewal. Mentioned ${i%2===0?"daughter's recital":"new office"}.`, at: d.toISOString().slice(0,10), author: owners[i%3] }],
    actionItems: i%3===0 ? [{ id:"a1", title:`Follow up on ${company} quote`, due: new Date(Date.now()+86400000*2).toISOString().slice(0,10), assignee: "You", isPrivate: false }]:[],
    color: ["#FF8A5B","#8B8AE0","#5BC4A8","#F7C948","#FF9EB5","#7CC8FF"][i%6],
    connections: Math.floor(Math.random()*6),
    happiness: [5,4,5,3,5,4,5,5,2,5,4,5,5,3,4,5,5,5,4,5,3,5,5,4][i],
  };
});

const templatesSeed: Template[] = [
  { id:"t1", title:"Birthday check-in", category:"Personal", subject:"Happy Birthday, {{firstName}}! 🎂", body:"Hi {{firstName}},\n\nJust wanted to wish you the happiest birthday! Hope {{company}} is giving you the day off.\n\nI remember you mentioned {{keyFact}} - hope you get to celebrate around that!\n\nCheers,\n{{sender}}", social:"Wishing the happiest birthday to our favorite people this week 🎂 Hope it's filled with joy!", gradient:"from-[#FFE9E0] to-[#FFD1BF]", icon:"🎂"},
  { id:"t2", title:"Home maintenance tip", category:"Value", subject:"Quick tip to save {{firstName}} ~$300 this season", body:"Hi {{firstName}},\n\nSaw this and thought of you - cleaning your gutters before winter can prevent ice dams that cost $2k+ to fix.\n\nWorth 20 mins this weekend. Let me know if you want my go-to handyman.\n\nBest,\n{{sender}}", social:"Fall tip: 20 mins cleaning gutters = $2k saved later. Your future self will thank you 🍂", gradient:"from-[#E6F5EC] to-[#C7EAD9]", icon:"🏠"},
  { id:"t3", title:"Market update", category:"Authority", subject:"What rates are doing for {{company}}", body:"Hi {{firstName}},\n\nQuick pulse check - carriers adjusted rates 6% this quarter in your zip.\n\nI've got 2 options that could keep you level if we review before {{renewalDate}}.\n\n15-min call next week?\n\n{{sender}}", social:"Insurance rates shifted 6% this month. If you haven't reviewed since spring, now's the time.", gradient:"from-[#E8E6FF] to-[#D4D1FF]", icon:"📈"},
  { id:"t4", title:"Thank you", category:"Gratitude", subject:"Thanks, {{firstName}}", body:"Hi {{firstName}},\n\nJust a quick note to say thank you. Working with folks like you at {{company}} is why I love what I do.\n\nGrateful for you,\n{{sender}}", social:"Gratitude post: thank you to the clients who make this work meaningful.", gradient:"from-[#FFF3D6] to-[#FFE9A8]", icon:"🙏"},
  { id:"t5", title:"Referral ask", category:"Growth", subject:"Who do you know like you, {{firstName}}?", body:"Hi {{firstName}},\n\nYou mentioned you know a few owners at {{company}}-type businesses.\n\nIf anyone's frustrated with their current coverage, I'd love an intro. I promise same personal care I give you.\n\nThanks for considering,\n{{sender}}", social:"The best clients come from introductions. If you know someone looking for a more human insurance experience...", gradient:"from-[#FFE0EC] to-[#FFC4D6]", icon:"🤝"},
  { id:"t6", title:"Renewal reminder", category:"Service", subject:"Your renewal on {{renewalDate}} - quick prep", body:"Hi {{firstName}},\n\nYour policy renews {{renewalDate}}. I pulled your file and {{keyFact}} is still noted.\n\nNo action needed yet, but want to lock current rate?\n\n{{sender}}", social:"Renewal season tip: 30 days early = more options and better rates.", gradient:"from-[#DDF2FF] to-[#B8E1FF]", icon:"🔄"},
  { id:"t7", title:"Just checking in", category:"Keep in Touch", subject:"Thinking of you, {{firstName}}", body:"Hi {{firstName}},\n\nHaven't caught up in a bit. How's {{company}} + {{keyFact}} going?\n\nNo agenda - just saying hi.\n\n{{sender}}", social:"Sometimes the best marketing is just... checking in. No pitch.", gradient:"from-[#FFF0E0] to-[#FFDAB3]", icon:"☕"},
  { id:"t8", title:"Local spotlight", category:"Community", subject:"Loved seeing {{company}} in the news", body:"Hi {{firstName}},\n\nSaw {{company}} featured locally - huge congrats!\n\nDeserved recognition.\n\n{{sender}}", social:"Shoutout to local businesses making our town better 👏", gradient:"from-[#E9FFE6] to-[#CFF5C8]", icon:"📍"},
  { id:"t9", title:"Review request", category:"Reputation", subject:"Quick favor, {{firstName}}?", body:"Hi {{firstName}},\n\nIf you've enjoyed working together, would you share a quick Google review? It helps other families find us.\n\nTakes 30 seconds: {{reviewLink}}\n\nThank you!\n{{sender}}", social:"If we've helped you this year, a quick review means the world.", gradient:"from-[#FFF8E1] to-[#FFECB3]", icon:"⭐"},
  { id:"t10", title:"Storm check", category:"Care", subject:"You good after yesterday's storm, {{firstName}}?", body:"Hi {{firstName}},\n\nHeard about the storm near {{company}}. Just checking you're okay - any damage I can help document for claims?\n\nHere if you need me,\n{{sender}}", social:"After the storm: 3 photos to take before cleanup for smoother claims.", gradient:"from-[#E0F0FF] to-[#C2DFFF]", icon:"⛈️"},
  { id:"t11", title:"New baby / Life event", category:"Personal", subject:"Congratulations! 🎉", body:"Hi {{firstName}},\n\nHeard the amazing news about {{keyFact}}! So happy for you.\n\nLet's update beneficiaries when you have a minute - no rush.\n\n{{sender}}", social:"Celebrating big life moments with our clients - the best part of this job.", gradient:"from-[#FFE6F2] to-[#FFCCE4]", icon:"👶"},
  { id:"t12", title:"Blog: 5 myths", category:"Content", subject:"5 myths costing {{firstName}} money", body:"Hi {{firstName}},\n\nWrote this for clients like you at {{company}}: 5 myths about umbrella policies.\n\nMyth #3 surprises most people.\n\nRead here: {{link}}\n\n{{sender}}", social:"Myth: umbrella is only for wealthy. Truth: it protects your paycheck.", gradient:"from-[#EDE8FF] to-[#D9D1FF]", icon:"📝"},
];

const automationsSeed: Automation[] = [
  { id:"a1", name:"Birthday Love", trigger:"Date field", triggerDetail:"Birthday is this week", active:true, enrolled:18, steps:[{type:"card",label:"Send handwritten birthday card",delay:"0d"},{type:"email",label:"Send Birthday check-in",delay:"1d"},{type:"task",label:"Call if no reply",delay:"3d"}], performance:{sent:124,open:84,reply:18}},
  { id:"a2", name:"90-Day Re-engagement", trigger:"No contact in X days", triggerDetail:"No contact in 60 days", active:true, enrolled:7, steps:[{type:"email",label:"Just checking in"},{type:"wait",label:"Wait 7 days",delay:"7d"},{type:"text",label:"Quick text nudge"},{type:"task",label:"Create action item"}], performance:{sent:42,open:58,reply:12}},
  { id:"a3", name:"VIP Nurture", trigger:"Tag added", triggerDetail:"Tag = VIP", active:true, enrolled:12, steps:[{type:"email",label:"Thank you (personal)"},{type:"wait",label:"Wait 14 days",delay:"14d"},{type:"email",label:"Market update"},{type:"wait",label:"Wait 30 days",delay:"30d"},{type:"email",label:"Referral ask"}], performance:{sent:96,open:71,reply:22}},
];

export default function App() {
  const [activeView, setActiveView] = useState("Dashboard");
  const [contacts, setContacts] = useState<Contact[]>(contactsSeed);
  const [templates] = useState<Template[]>(templatesSeed);
  const [automations, setAutomations] = useState<Automation[]>(automationsSeed);
  const [search, setSearch] = useState("");
  const [contactViewMode, setContactViewMode] = useState<"table"|"grid">("table");
  const [selectedContact, setSelectedContact] = useState<Contact|null>(null);
  const [showAddContact, setShowAddContact] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerTemplate, setComposerTemplate] = useState<Template| null>(templates[0]);
  const [composerRecipientsTag, setComposerRecipientsTag] = useState("VIP");
  const [composerSubject, setComposerSubject] = useState("");
  const [composerBody, setComposerBody] = useState("");
  const [showLev, setShowLev] = useState(false);
  const [levInput, setLevInput] = useState("");
  const [levOutput, setLevOutput] = useState("Hi! I'm Lev 🦁 Your keep-in-touch copilot. Ask me to rewrite an email, suggest who to contact, or draft content from a prompt.");
  const [inboxThreads, setInboxThreads] = useState([
    { id:"t1", contactId:"c1", name:"Ava Rivera", snippet:"Thanks so much! Loved the birthday note", time:"2h ago", unread: true, channel:"email" as const },
    { id:"t2", contactId:"c5", name:"Isabella Garcia", snippet:"Can we move renewal call to Thu?", time:"5h ago", unread:true, channel:"text" as const },
    { id:"t3", contactId:"c3", name:"Sofia Patel", snippet:"Referral: meet my brother-in-law David", time:"Yesterday", unread:false, channel:"email" as const },
  ]);
  const [selectedThread, setSelectedThread] = useState(inboxThreads[0]);
  const [reportingSends, setReportingSends] = useState(312);
  const [toasts, setToasts] = useState<string[]>([]);
  const [kanban, setKanban] = useState({
    New: ["c4","c9"],
    Contacted: ["c2","c7"],
    Nurturing: ["c1","c5","c11"],
    Won: ["c3"],
  });
  const [calendarMonth] = useState(new Date(2025, 9, 1));
  const [meetingTitle, setMeetingTitle] = useState("15-min Insurance Review");
  const [tagFilter, setTagFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [showCampaignCalendar, setShowCampaignCalendar] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  const addToast = (msg:string)=>{ setToasts(t=>[msg, ...t].slice(0,3)); setTimeout(()=>setToasts(t=>t.slice(0,-1)), 2500); };
  const navigate = (view:string)=>{ setActiveView(view); try{ window.scrollTo({top:0, behavior:"smooth"});}catch{}; if(view===activeView) addToast(`Viewing ${view} • all caught up`); else addToast(`Opened ${view}`); };

  const filteredContacts = useMemo(()=>{
    return contacts.filter(c=>{
      const q = search.toLowerCase();
      const matchesQ = !q || `${c.firstName} ${c.lastName} ${c.company} ${c.email}`.toLowerCase().includes(q);
      const matchesTag = tagFilter==="All" || c.tags.includes(tagFilter);
      const last = new Date(c.lastContacted).getTime();
      const due = last + c.keepInterval*86400000;
      const now = Date.now();
      const overdue = due < now;
      const dueSoon = !overdue && due - now < 7*86400000;
      const status = overdue ? "Overdue" : dueSoon ? "Due soon" : "On track";
      const matchesStatus = statusFilter==="All" || status===statusFilter;
      return matchesQ && matchesTag && matchesStatus;
    });
  },[contacts, search, tagFilter, statusFilter]);

  const overdueContacts = useMemo(()=>{
    const now = Date.now();
    return contacts.filter(c=> new Date(c.lastContacted).getTime() + c.keepInterval*86400000 < now);
  },[contacts]);

  const birthdaysThisWeek = contacts.filter((_,i)=> i<5);
  const actionItemsDue = contacts.flatMap(c=> c.actionItems.map(a=>({...a, contact:c}))).slice(0,4);

  // send logic
  const handleSend = () => {
    const recips = contacts.filter(c=> c.tags.includes(composerRecipientsTag));
    const nowStr = new Date().toISOString().slice(0,10);
    setContacts(prev=> prev.map(c=> recips.find(r=>r.id===c.id) ? {...c, lastContacted: nowStr} : c));
    setReportingSends(s=> s+ recips.length);
    setInboxThreads(t=> [...recips.slice(0,2).map((c,i)=>({ id:`n${Date.now()+i}`, contactId:c.id, name:`${c.firstName} ${c.lastName}`, snippet: composerSubject || "Thanks!", time:"now", unread:true, channel:"email" as const })), ...t]);
    addToast(`Sent ${recips.length} personal emails via Gmail - looks 1:1, no bulk footer`);
    setComposerOpen(false);
    // automation enrollment mock when VIP
    if(composerRecipientsTag==="VIP"){
      setAutomations(a=> a.map(au=> au.id==="a3" ? {...au, enrolled: au.enrolled + recips.length} : au));
    }
  };

  const handleAddContact = (e: React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const first = fd.get("first") as string;
    const last = fd.get("last") as string;
    const comp = fd.get("company") as string;
    const newC: Contact = {
      id:`c${Date.now()}`,
      firstName:first, lastName:last, company: comp || "New Co",
      email:`${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
      phone:"(555) 010-0000",
      tags:["New Lead"], owner:"You",
      lastContacted: new Date().toISOString().slice(0,10),
      keepInterval:30,
      birthday:"2025-11-20", renewal:"2026-03-15",
      keyFacts:[{id:"kf0",label:"Met at",value:"Introduced via referral",type:"info"}],
      notes:[], actionItems:[], color:"#FF8A5B", connections:0, happiness:5
    };
    setContacts(c=>[newC,...c]); setShowAddContact(false); addToast(`Added ${first} ${last} - dashboard updated`);
  };

  const updateContactKeep = (id:string, interval:number)=>{
    setContacts(cs=> cs.map(c=> c.id===id? {...c, keepInterval:interval}:c));
    addToast(`Keep-in-touch set to every ${interval} days`);
  };

  const handleLevAction = (action:string)=>{
    if(action==="rewrite"){
      setLevOutput("Rewritten (warm & professional):\n\nHi there!\n\nI was just thinking about you and wanted to check in. Hope things at Rivera Homes are going wonderfully. No agenda—just grateful for you.\n\nWarmly,\nYou");
      addToast("Lev rewrote tone to warm professional");
    } else if(action==="suggest"){
      const names = overdueContacts.slice(0,3).map(c=> `${c.firstName} ${c.lastName}`).join(", ");
      setLevOutput(`Keep-in-touch Agent:\n• You haven't talked to ${names} in 45+ days\n• 2 birthdays this week (Ava, Sofia)\n• 1 renewal at risk: Isabella Garcia (due in 9 days)\n\nWant me to draft a check-in for them?`);
    } else if(action==="translate"){
      setLevOutput("Translated to Spanish (mock):\n\n¡Hola {{firstName}}!\n\nSolo quería saludarte y desearte un feliz cumpleaños. Espero que todo vaya genial en {{company}}.\n\n¡Abrazos!");
    } else if(action==="generate"){
      if(!levInput) { setLevOutput("Tell me what to write about - e.g. 'market update for homeowners worried about rates'"); return; }
      setLevOutput(`Generated draft for: "${levInput}"\n\nSubject: Quick thought that might help\n\nHi {{firstName}},\n\nI saw something about ${levInput} and thought of you...\n[full draft ready to personalize with Key Facts]`);
    }
  };

  // Calendar events mock
  const calendarEvents = useMemo(()=>{
    const ev: {day:number; label:string; type:string}[] = [];
    contacts.slice(0,8).forEach((c,i)=>{ const day = 3 + (i*3)%25; ev.push({day, label:`🎂 ${c.firstName}`, type:"birthday"}); });
    ev.push({day:12, label:"📧 Birthday check-in (12 contacts)", type:"campaign"});
    ev.push({day:18, label:"📱 90-day re-engagement", type:"automation"});
    ev.push({day:22, label:"📝 Social: Market update", type:"social"});
    return ev;
  },[contacts]);

  return (
    <div className="min-h-screen bg-[#FFFBF5] text-[#2B211D] selection:bg-[#FFDCCB]" style={{fontFamily:"Inter, ui-sans-serif, system-ui"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');`}</style>

      {/* Top Nav - z-20 per spec */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl border-b border-[#F0E6DE]">
        <div className="h-[64px] flex items-center justify-between px-4 md:px-6 gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF7A45] to-[#FFB347] grid place-items-center text-white font-bold shadow-sm">L</div>
            <div className="hidden md:flex items-center gap-2 bg-[#FFF6EF] border border-[#F2E6DE] rounded-full px-3 py-1.5 text-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="font-medium">Horizon Insurance • Main</span>
              <ChevronRight className="w-4 h-4 opacity-40"/>
            </div>
            <button onClick={()=>navigate("Dashboard")} className="md:hidden p-2 rounded-xl bg-[#FFF1E8]"><LayoutDashboard className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 max-w-[480px] relative hidden md:block">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40"/>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search contacts, campaigns, notes..." className="w-full pl-9 pr-3 py-2.5 rounded-full bg-[#FFF6EF] border border-[#F2E6DE] text-sm outline-none focus:ring-2 focus:ring-[#FFDCCB]"/>
            {search && <button onClick={()=>setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/5"><X className="w-4 h-4"/></button>}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>setShowLev(!showLev)} className="inline-flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-[#2B211D] text-white text-sm font-medium shadow-sm hover:translate-y-[-1px] transition">
              <span className="hidden md:inline">Ask Lev</span><span className="md:hidden">Lev</span> <span className="text-[15px]">🦁</span> <Sparkles className="w-4 h-4 opacity-80"/>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-400 to-orange-300 border border-white shadow-sm"/>
          </div>
        </div>
        {/* mobile search */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-40"/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search..." className="w-full pl-9 pr-3 py-2 rounded-full bg-[#FFF6EF] border border-[#F2E6DE] text-sm"/>
          </div>
        </div>
      </header>

      <div className="flex w-full max-w-[1440px] mx-auto">
        {/* Sidebar - fixed 280px, z-10, 8px gap between nav items */}
        <aside className="hidden lg:flex w-[280px] shrink-0 flex-col sticky top-[64px] h-[calc(100vh-64px)] p-4 gap-2 bg-white/60 border-r border-[#F0E6DE] backdrop-blur z-10">
          <nav className="flex flex-col gap-2">
            {[
              {k:"Dashboard", i:LayoutDashboard},
              {k:"Contacts", i:Users},
              {k:"Campaigns", i:Megaphone},
              {k:"Content Calendar", i:CalendarDays},
              {k:"Automations", i:Workflow},
              {k:"Inbox", i:Inbox},
              {k:"Meetings", i:Video},
              {k:"Surveys & Reviews", i:Star},
              {k:"Reporting", i:BarChart3},
              {k:"Settings", i:Settings2},
            ].map(item=>{
              const active = activeView===item.k;
              return <button key={item.k} onClick={()=>navigate(item.k)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[14px] font-medium transition text-left leading-6 ${active?"bg-[#2B211D] text-white shadow-sm":"hover:bg-[#FFF1E8] text-[#6B5A52] hover:text-[#2B211D]"}`}>
                <item.i className="w-[18px] h-[18px] shrink-0"/><span className="truncate">{item.k}</span>{item.k==="Inbox" && <span className="ml-auto text-[11px] bg-[#FF7A45] text-white px-1.5 py-0.5 rounded-full">2</span>}
              </button>
            })}
          </nav>
          <div className="mt-auto p-4 rounded-2xl bg-gradient-to-br from-[#FFF1E8] to-[#FFDFCC] border border-[#FFDCCB]">
            <div className="text-[14px] font-semibold flex items-center gap-2 leading-6"><Heart className="w-4 h-4 text-[#FF7A45]"/> Happiness Score</div>
            <div className="text-3xl font-bold mt-2">4.9 <span className="text-sm font-medium opacity-60">/5</span></div>
            <div className="text-xs leading-5 opacity-70 mt-1 max-w-[65ch]">Based on 127 responses • +0.2 this month</div>
          </div>
        </aside>

        {/* Mobile bottom nav - collapse to drawer at lg */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-20 bg-white border-t border-[#F0E6DE] flex overflow-x-auto no-scrollbar">
          {["Dashboard","Contacts","Campaigns","Automations","Inbox"].map(k=>(
            <button key={k} onClick={()=>navigate(k)} className={`flex-1 min-w-[72px] py-3 text-[11px] font-medium tracking-wide ${activeView===k?"text-[#FF7A45]":"text-[#8A7A73]"}`}>{k}</button>
          ))}
        </div>

        {/* Main - container system: max-w 1440 already on parent, inner px-6 lg:px-8 py-8 gap-8 */}
        <main className="flex-1 min-w-0 px-6 lg:px-8 py-8 pb-24 lg:pb-8">
          <div className="max-w-[1440px] mx-auto w-full flex flex-col gap-8">
          {/* Dashboard - tightened: 2-col metrics, p-6 gap-6, section mt-10, max 65ch */}
          {activeView==="Dashboard" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[65ch]">
                  <h1 className="text-xl font-semibold tracking-tight leading-6">Good morning, Alex ☀️</h1>
                  <p className="text-[14px] leading-6 text-[#8A7A73] mt-2">You have <span className="font-semibold text-[#2B211D]">{overdueContacts.length} contacts</span> needing attention and 2 birthdays this week.</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={()=>{navigate("Campaigns"); setComposerOpen(true);}} className="px-4 py-2.5 rounded-full bg-[#FF7A45] text-white text-[14px] font-semibold shadow-sm hover:brightness-105 leading-6">New Campaign</button>
                  <button onClick={()=>setShowAddContact(true)} className="px-4 py-2.5 rounded-full bg-white border border-[#EDE1D9] text-[14px] font-medium leading-6">Add Contact</button>
                </div>
              </div>

              {/* Metrics - 1-col mobile, 2-col lg with breathing room */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {label:"Needs attention", value: overdueContacts.length, sub:"overdue keep-in-touch", icon:AlertCircle, tint:"bg-[#FFF0E8]"},
                  {label:"Open rate", value:"64.2%", sub:"+3.1% vs last month", icon:Eye, tint:"bg-[#E8E6FF]"},
                  {label:"Reply rate", value:"11%", sub:"1:1 personal sends", icon:MessageSquare, tint:"bg-[#E6F5EC]"},
                  {label:"Happiness", value:"4.9", sub:"127 responses", icon:Star, tint:"bg-[#FFF3D6]"},
                ].map(m=>(
                  <div key={m.label} className="rounded-[20px] bg-white border border-[#F0E6DE] p-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.12)] flex flex-col gap-3">
                    <div className={`w-10 h-10 rounded-xl grid place-items-center ${m.tint} shrink-0`}><m.icon className="w-5 h-5"/></div>
                    <div className="flex flex-col gap-1">
                      <div className="text-[11px] uppercase tracking-wider opacity-60 font-semibold truncate">{m.label}</div>
                      <div className="text-[26px] font-bold leading-none tracking-tight">{m.value}</div>
                      <div className="text-[12px] leading-5 opacity-60 truncate max-w-[65ch]">{m.sub}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6 mt-2">
                {/* Left widgets */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                      <div className="flex items-center justify-between gap-3"><h3 className="text-[15px] font-semibold flex items-center gap-2 leading-6"><Gift className="w-4 h-4"/> Birthdays this week</h3><button onClick={()=>navigate("Content Calendar")} className="text-[12px] font-medium text-[#FF7A45] leading-5 shrink-0">View calendar</button></div>
                      <div className="mt-6 flex flex-col gap-4">
                        {birthdaysThisWeek.map(c=>(
                          <div key={c.id} className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full grid place-items-center text-white text-sm font-bold" style={{background:c.color}}>{c.firstName[0]}{c.lastName[0]}</div>
                            <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{c.firstName} {c.lastName}</div><div className="text-xs opacity-60">{c.company}</div></div>
                            <button onClick={()=>{setComposerTemplate(templates[0]); setComposerOpen(true);}} className="px-3 py-1.5 rounded-full bg-[#FFF1E8] text-xs font-medium border">Send card</button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                      <div className="flex items-center justify-between gap-3"><h3 className="text-[15px] font-semibold flex items-center gap-2 leading-6"><Clock className="w-4 h-4"/> Action Items due</h3></div>
                      <div className="mt-6 flex flex-col gap-4">
                        {actionItemsDue.map(a=>(
                          <div key={a.id} className="flex gap-3 items-start">
                            <div className="mt-0.5 w-6 h-6 rounded-full bg-[#FFF1E8] grid place-items-center shrink-0"><FileText className="w-3.5 h-3.5"/></div>
                            <div className="flex-1 min-w-0"><div className="text-[14px] font-medium leading-6 truncate">{a.title}</div><div className="text-[12px] leading-5 opacity-60">{a.contact.firstName} • due {a.due}</div></div>
                            <button onClick={()=>addToast("Marked as planned for this session")} className="text-xs px-2.5 py-1 rounded-full bg-[#2B211D] text-white h-fit shrink-0">Plan</button>
                          </div>
                        ))}
                        {actionItemsDue.length===0 && <div className="text-[14px] leading-6 opacity-60 max-w-[65ch]">No action items due — you're all caught up 🎉</div>}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-[15px] font-semibold leading-6">Opportunity board</h3><button onClick={()=>navigate("Reporting")} className="text-[12px] font-medium flex items-center gap-1 leading-5">Open board <ArrowUpRight className="w-3 h-3"/></button></div>
                    <div className="mt-6 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4">
                      {Object.entries(kanban).map(([col, ids])=>(
                        <div key={col} className="rounded-2xl bg-[#FFFBF7] border border-[#F2E6DE] p-4 min-w-[300px] snap-start shrink-0">
                          <div className="text-[11px] uppercase tracking-wider opacity-60 font-semibold">{col} • {ids.length}</div>
                          <div className="mt-4 flex flex-col gap-3">
                            {ids.map(cid=>{
                              const c = contacts.find(x=>x.id===cid); if(!c) return null;
                              return <div key={cid} className="rounded-xl bg-white border border-[#F0E6DE] p-3 text-[13px] leading-5">
                                <div className="font-medium truncate">{c.firstName} {c.lastName}</div>
                                <div className="opacity-60 truncate text-[12px] leading-5">{c.company}</div>
                              </div>
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right column */}
                <div className="flex flex-col gap-6">
                  <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                    <h3 className="text-[15px] font-semibold leading-6">Recent sends performance</h3>
                    <div className="mt-6 flex flex-col gap-4">
                      {[
                        {t:"Home maintenance tip", o:"68%", r:"9%"},
                        {t:"Thank you", o:"71%", r:"14%"},
                        {t:"Market update", o:"59%", r:"11%"},
                      ].map(r=>(
                        <div key={r.t} className="flex items-center justify-between gap-3 text-[14px] leading-6"><span className="truncate pr-2 max-w-[65ch]">{r.t}</span><span className="flex gap-2 text-xs shrink-0"><span className="px-2 py-1 rounded-full bg-[#E8E6FF]">{r.o} open</span><span className="px-2 py-1 rounded-full bg-[#E6F5EC]">{r.r} reply</span></span></div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-[20px] bg-gradient-to-br from-[#2B211D] to-[#3D2E27] text-white p-6">
                    <div className="text-[14px] font-medium opacity-80 flex items-center gap-2 leading-6"><Zap className="w-4 h-4"/> Keep-in-touch agent</div>
                    <div className="mt-3 text-[14px] leading-6 max-w-[65ch]">You haven't talked to <b>3 VIPs</b> in 45 days. Want Lev to draft personal check-ins using their Key Facts?</div>
                    <button onClick={()=>setShowLev(true)} className="mt-6 px-4 py-2 rounded-full bg-white text-[#2B211D] text-[14px] font-semibold leading-6">Draft with Lev 🦁</button>
                  </div>
                  <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                    <h3 className="text-[15px] font-semibold flex items-center gap-2 leading-6"><Star className="w-4 h-4 text-amber-500"/> Google Reviews</h3>
                    <div className="mt-3 text-[14px] leading-6">2 new reviews to respond • avg 4.9</div>
                    <div className="mt-4 p-3 rounded-xl bg-[#FFFBF0] border border-[#FFE6CC] text-[14px] leading-6 max-w-[65ch]">"Alex was amazing during our claim..." - Grace L.</div>
                    <button onClick={()=>setActiveView("Surveys & Reviews")} className="mt-4 w-full py-2.5 rounded-full bg-[#FFF1E8] text-[14px] font-medium border leading-6">Respond with AI</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contacts - tightened layout, sticky thead, fixed columns, responsive switch */}
          {activeView==="Contacts" && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-wrap gap-3 items-center justify-between">
                <h1 className="text-xl font-semibold leading-6">Contacts <span className="text-[14px] font-medium opacity-50">• {filteredContacts.length}</span></h1>
                <div className="flex items-center gap-3">
                  <div className="flex rounded-full bg-white border border-[#EDE1D9] p-1 gap-1">
                    <button onClick={()=>setContactViewMode("table")} className={`p-2 rounded-full ${contactViewMode==="table"?"bg-[#2B211D] text-white":""}`}><TableIcon className="w-4 h-4"/></button>
                    <button onClick={()=>setContactViewMode("grid")} className={`p-2 rounded-full ${contactViewMode==="grid"?"bg-[#2B211D] text-white":""}`}><LayoutGrid className="w-4 h-4"/></button>
                  </div>
                  <button onClick={()=>setShowAddContact(true)} className="px-4 py-2 rounded-full bg-[#2B211D] text-white text-[14px] font-medium inline-flex items-center gap-2 leading-6"><Plus className="w-4 h-4"/>Add contact</button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <select value={tagFilter} onChange={e=>setTagFilter(e.target.value)} className="px-3 py-2 rounded-full bg-white border border-[#EDE1D9] text-[14px] leading-6">
                  <option value="All">All tags</option>{tagPool.map(t=><option key={t} value={t}>{t}</option>)}
                </select>
                <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="px-3 py-2 rounded-full bg-white border border-[#EDE1D9] text-[14px] leading-6">
                  <option value="All">All status</option><option>Overdue</option><option>Due soon</option><option>On track</option>
                </select>
                <button onClick={()=>addToast("CSV import ready - choose file to preview")} className="px-3 py-2 rounded-full bg-white border text-[14px] leading-6">Import CSV</button>
                <button onClick={()=>addToast("Business card scan opened - camera preview ready")} className="px-3 py-2 rounded-full bg-white border text-[14px] leading-6">Scan card</button>
                <div className="ml-auto flex gap-3 flex-wrap">
                  <button onClick={()=>addToast(`Added tag VIP to ${filteredContacts.length} contacts (session)`)} className="px-3 py-2 rounded-full bg-[#FFF1E8] border text-[14px] leading-6">Bulk: Add tag</button>
                  <button onClick={()=>{setComposerOpen(true);}} className="px-3 py-2 rounded-full bg-[#FFF1E8] border text-[14px] leading-6">Bulk: Start email</button>
                  <button onClick={()=>addToast("Exported 24 contacts as CSV (preview)")} className="px-3 py-2 rounded-full bg-white border text-[14px] leading-6 inline-flex items-center gap-1"><ExternalLink className="w-3.5 h-3.5"/>Export</button>
                </div>
              </div>

              {contactViewMode==="table" ? (
                <>
                <div className="hidden lg:block rounded-[20px] bg-white border border-[#F0E6DE] overflow-hidden">
                  <div className="overflow-auto max-h-[70vh]">
                    <table className="w-full text-[14px] leading-6 table-fixed">
                      <thead className="text-[11px] uppercase tracking-wider opacity-60 border-b bg-[#FFFBF7] sticky top-0 z-[1]">
                        <tr>
                          <th className="text-left py-4 px-4 font-semibold w-[260px] min-w-[220px]">Name</th>
                          <th className="text-left py-4 px-4 font-semibold w-[160px] min-w-[140px]">Company</th>
                          <th className="text-left py-4 px-4 font-semibold w-[160px] min-w-[140px]">Tags</th>
                          <th className="text-left py-4 px-4 font-semibold w-[150px] min-w-[130px]">Keep in touch</th>
                          <th className="text-left py-4 px-4 font-semibold w-[130px] min-w-[120px]">Last contacted</th>
                          <th className="text-left py-4 px-4 font-semibold w-[110px] min-w-[90px]">Owner</th>
                          <th className="py-4 px-4 w-[40px]"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F0E6DE]">
                        {filteredContacts.map(c=>{
                          const due = new Date(c.lastContacted).getTime() + c.keepInterval*86400000;
                          const diff = due - Date.now();
                          const status = diff<0 ? "Overdue" : diff<7*86400000 ? "Due soon" : "On track";
                          return <tr key={c.id} className="hover:bg-[#FFFBF7] cursor-pointer" onClick={()=>setSelectedContact(c)}>
                            <td className="py-4 px-4"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full grid place-items-center text-white text-xs font-bold shrink-0" style={{background:c.color}}>{c.firstName[0]}{c.lastName[0]}</div><div className="min-w-0"><div className="font-medium truncate">{c.firstName} {c.lastName}</div><div className="text-[12px] leading-5 opacity-60 truncate">{c.email}</div></div></div></td>
                            <td className="py-4 px-4 truncate">{c.company}</td>
                            <td className="py-4 px-4"><div className="flex gap-1.5 flex-wrap">{c.tags.map(t=><span key={t} className="px-2 py-0.5 rounded-full bg-[#FFF1E8] border text-[11px] leading-4">{t}</span>)}</div></td>
                            <td className="py-4 px-4"><span className={`px-2 py-1 rounded-full text-[11px] font-medium border leading-4 ${status==="Overdue"?"bg-[#FFE9E0] border-[#FFCBB5] text-[#A33D1A]": status==="Due soon"?"bg-[#FFF3D6] border-[#FFE6A8]":"bg-[#E6F5EC] border-[#C7EAD9]"}`}>{status} • {c.keepInterval}d</span></td>
                            <td className="py-4 px-4 text-[13px]">{c.lastContacted}</td>
                            <td className="py-4 px-4 truncate">{c.owner}</td>
                            <td className="py-4 px-4"><MoreHorizontal className="w-4 h-4 opacity-40"/></td>
                          </tr>
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {filteredContacts.map(c=>(
                    <div key={c.id} onClick={()=>setSelectedContact(c)} className="rounded-[18px] bg-white border border-[#F0E6DE] p-6 cursor-pointer hover:shadow-sm transition flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3"><div className="w-10 h-10 rounded-full grid place-items-center text-white font-bold shrink-0" style={{background:c.color}}>{c.firstName[0]}{c.lastName[0]}</div><span className="text-[11px] px-2 py-1 rounded-full bg-[#FFF6EF] border tracking-wide">{c.owner}</span></div>
                      <div className="min-w-0"><div className="font-semibold text-[14px] leading-6 truncate">{c.firstName} {c.lastName}</div><div className="text-[12px] leading-5 opacity-60 truncate">{c.company}</div></div>
                      <div className="flex gap-1.5 flex-wrap">{c.tags.slice(0,2).map(t=><span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF1E8] border leading-4">{t}</span>)}</div>
                      <div className="text-[12px] leading-5 opacity-60">Last: {c.lastContacted} • Every {c.keepInterval}d</div>
                    </div>
                  ))}
                </div>
                </>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredContacts.map(c=>(
                    <div key={c.id} onClick={()=>setSelectedContact(c)} className="rounded-[18px] bg-white border border-[#F0E6DE] p-6 cursor-pointer hover:shadow-sm transition flex flex-col gap-3">
                      <div className="flex items-start justify-between gap-3"><div className="w-10 h-10 rounded-full grid place-items-center text-white font-bold shrink-0" style={{background:c.color}}>{c.firstName[0]}{c.lastName[0]}</div><span className="text-[11px] px-2 py-1 rounded-full bg-[#FFF6EF] border tracking-wide">{c.owner}</span></div>
                      <div><div className="font-semibold text-[14px] leading-6">{c.firstName} {c.lastName}</div><div className="text-[12px] leading-5 opacity-60 truncate">{c.company}</div></div>
                      <div className="flex gap-1.5 flex-wrap">{c.tags.slice(0,2).map(t=><span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF1E8] border leading-4">{t}</span>)}</div>
                      <div className="text-[12px] leading-5 opacity-60">Last: {c.lastContacted} • Every {c.keepInterval}d</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Campaigns - tightened spacing, p-6 gap-6 */}
          {activeView==="Campaigns" && (
            <div className="flex flex-col gap-8">
              <div className="flex flex-wrap justify-between gap-4 items-center">
                <h1 className="text-xl font-semibold leading-6">Campaigns & Content Library</h1>
                <button onClick={()=>setComposerOpen(true)} className="px-4 py-2.5 rounded-full bg-[#FF7A45] text-white text-[14px] font-semibold inline-flex items-center gap-2 leading-6"><Wand2 className="w-4 h-4"/>New Campaign</button>
              </div>
              <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                {templates.map(t=>(
                  <div key={t.id} className="rounded-[20px] border border-[#F0E6DE] bg-white overflow-hidden flex flex-col">
                    <div className={`h-[96px] bg-gradient-to-br ${t.gradient} p-4 flex items-start justify-between gap-3`}>
                      <span className="text-2xl shrink-0">{t.icon}</span><span className="text-[11px] tracking-wide px-2 py-1 rounded-full bg-white/80 border backdrop-blur shrink-0">{t.category}</span>
                    </div>
                    <div className="p-6 flex-1 flex flex-col gap-3">
                      <div className="font-semibold text-[15px] leading-6">{t.title}</div>
                      <div className="text-[12px] leading-5 opacity-60 line-clamp-2 max-w-[65ch]">{t.subject}</div>
                      <div className="mt-2 flex gap-3">
                        <button onClick={()=>{setComposerTemplate(t); setComposerSubject(t.subject); setComposerBody(t.body); setComposerOpen(true);}} className="flex-1 py-2 rounded-full bg-[#2B211D] text-white text-[12px] font-medium leading-5">Use template</button>
                        <button onClick={()=>{setComposerTemplate(t); setShowCampaignCalendar(true);}} className="px-3 py-2 rounded-full bg-[#FFF6EF] border text-[12px] leading-5">Preview</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calendar */}
          {activeView==="Content Calendar" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-xl font-semibold leading-6">Content Calendar • October 2025</h1>
              <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                <div className="grid grid-cols-7 text-[11px] uppercase tracking-wider opacity-60 font-semibold mb-4 gap-2"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
                <div className="grid grid-cols-7 gap-3">
                  {Array.from({length:31}).map((_,i)=>{
                    const day=i+1; const evs = calendarEvents.filter(e=>e.day===day);
                    return <div key={day} className="min-h-[96px] rounded-2xl border border-[#F2E6DE] bg-[#FFFBF7] p-3">
                      <div className="text-[12px] font-semibold leading-5">{day}</div>
                      <div className="mt-2 flex flex-col gap-1.5">{evs.map((e,idx)=><div key={idx} className={`text-[11px] leading-4 px-2 py-1 rounded-full border truncate ${e.type==="birthday"?"bg-white": e.type==="campaign"?"bg-[#E8E6FF]":"bg-[#E6F5EC]"}`}>{e.label}</div>)}</div>
                    </div>
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Automations */}
          {activeView==="Automations" && (
            <div className="flex flex-col gap-8">
              <div className="flex justify-between items-center gap-4"><h1 className="text-xl font-semibold leading-6">Automations</h1><button onClick={()=>addToast("Automation builder opened - drag to arrange steps")} className="px-4 py-2 rounded-full bg-[#2B211D] text-white text-[14px] leading-6">New Automation</button></div>
              <div className="grid lg:grid-cols-3 gap-6">
                {automations.map(a=>(
                  <div key={a.id} className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><div className="font-semibold text-[15px] leading-6 truncate">{a.name}</div><div className="text-[12px] leading-5 opacity-60 mt-1 max-w-[65ch] truncate">{a.trigger} • {a.triggerDetail}</div></div>
                      <button onClick={()=>setAutomations(list=>list.map(x=> x.id===a.id? {...x, active:!x.active}:x))} className={`px-3 py-1 rounded-full text-[12px] font-medium border leading-5 shrink-0 ${a.active?"bg-[#E6F5EC] border-[#BFE8D0]":"bg-[#FFF1E8] border-[#FFDCCB]"}`}>{a.active?"Active":"Paused"}</button>
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                      {a.steps.map((s,i)=>(
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <div className="w-6 h-6 rounded-full bg-[#FFFBF0] border grid place-items-center"><span className="text-[11px]">{s.type==="email"?"📧": s.type==="text"?"📱": s.type==="card"?"✉️": s.type==="task"?"✅":"⏳"}</span></div>
                          <div className="flex-1">{s.label}{s.delay && <span className="opacity-50 text-xs"> • {s.delay}</span>}</div>
                          {i < a.steps.length-1 && <div className="absolute hidden"/>}
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                      <div className="rounded-xl bg-[#FFFBF7] border p-3"><div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">Sent</div><div className="font-semibold text-[14px] leading-6 mt-1">{a.performance.sent}</div></div>
                      <div className="rounded-xl bg-[#FFFBF7] border p-3"><div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">Open</div><div className="font-semibold text-[14px] leading-6 mt-1">{a.performance.open}%</div></div>
                      <div className="rounded-xl bg-[#FFFBF7] border p-3"><div className="text-[11px] uppercase tracking-wider opacity-60 font-medium">Reply</div><div className="font-semibold text-[14px] leading-6 mt-1">{a.performance.reply}%</div></div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={()=>addToast(`Enrolled ${a.enrolled} contacts - showing logs preview`)} className="flex-1 py-2 rounded-full bg-[#FFF6EF] border text-[12px] font-medium leading-5">{a.enrolled} enrolled</button>
                      <button onClick={()=>{setTagFilter("VIP"); setActiveView("Contacts"); addToast("When you add tag VIP, contacts auto-enroll (session preview)");}} className="px-3 py-2 rounded-full bg-[#2B211D] text-white text-[12px] leading-5">Test tag trigger</button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-[20px] bg-[#FFF6EF] border border-[#FFE2CC] p-6 mt-2">
                <h3 className="text-[15px] font-semibold flex items-center gap-2 leading-6"><Lightbulb className="w-4 h-4 text-[#FF7A45]"/> How triggers work (Levitate-style)</h3>
                <p className="text-[14px] leading-6 opacity-70 mt-2 max-w-[65ch]">Automations fire on Tag added, Birthday, No contact in X days, New contact, or Date field (renewal). Actions send as 1:1 via your Gmail/Outlook so they hit the primary inbox, not promotions.</p>
              </div>
            </div>
          )}

          {/* Inbox */}
          {activeView==="Inbox" && (
            <div className="rounded-[20px] bg-white border border-[#F0E6DE] overflow-hidden grid md:grid-cols-[320px_1fr] min-h-[560px]">
              <div className="border-r border-[#F0E6DE] bg-[#FFFBF7] flex flex-col">
                <div className="p-4 border-b"><div className="font-semibold text-[14px] leading-6">Unified Inbox</div><div className="text-[12px] leading-5 opacity-60">Email replies + Texts via (415) 555-0142</div></div>
                <div className="p-3 flex flex-col gap-2 overflow-auto">
                  {inboxThreads.map(th=>(
                    <button key={th.id} onClick={()=>setSelectedThread(th)} className={`w-full text-left p-3 rounded-xl border ${selectedThread.id===th.id?"bg-white border-[#E8DCCF] shadow-sm":"border-transparent hover:bg-white"}`}>
                      <div className="flex justify-between gap-2"><span className="font-medium text-[14px] leading-6 truncate">{th.name}</span><span className="text-[11px] opacity-60 shrink-0">{th.time}</span></div>
                      <div className="text-[12px] leading-5 opacity-70 truncate mt-1 max-w-[65ch]">{th.snippet}</div>
                      <div className="mt-2 flex gap-2"><span className={`text-[10px] px-1.5 py-0.5 rounded-full border leading-4 ${th.channel==="email"?"bg-[#E8E6FF]":"bg-[#E6F5EC]"}`}>{th.channel}</span>{th.unread && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#FF7A45] text-white leading-4">new</span>}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col">
                <div className="p-4 border-b flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0"><div className="w-9 h-9 rounded-full bg-[#FFD1BF] grid place-items-center font-bold shrink-0">{selectedThread.name[0]}</div><div className="min-w-0"><div className="font-semibold text-[14px] leading-6 truncate">{selectedThread.name}</div><div className="text-[12px] leading-5 opacity-60">{selectedThread.channel} thread • via Gmail</div></div></div>
                  <div className="flex gap-2 shrink-0"><button onClick={()=>addToast("Added Key Fact from thread (session)")} className="px-3 py-1.5 rounded-full bg-[#FFF1E8] border text-[12px] leading-5">Add Key Fact</button><button onClick={()=>addToast("Note added from thread")} className="px-3 py-1.5 rounded-full bg-white border text-[12px] leading-5">Add Note</button></div>
                </div>
                <div className="flex-1 p-6 space-y-4 bg-[#FFFEFD]">
                  <div className="max-w-[70%] p-4 rounded-2xl rounded-bl-sm bg-[#FFF1E8] border text-[14px] leading-6 max-w-[65ch]">Thanks so much! Loved the birthday note - Maple says hi too 🐶</div>
                  <div className="max-w-[70%] ml-auto p-4 rounded-2xl rounded-br-sm bg-[#2B211D] text-white text-[14px] leading-6 max-w-[65ch]">So glad! How's the new office coming? Remembered you mentioned the renovation.</div>
                  <div className="text-[11px] tracking-wide text-center opacity-40">Gmail • Looks like a normal 1:1 thread, no bulk footer</div>
                </div>
                <div className="p-4 border-t flex gap-3">
                  <input placeholder={`Reply to ${selectedThread.name}...`} className="flex-1 px-4 py-2.5 rounded-full bg-[#FFF6EF] border text-[14px] leading-6 outline-none min-w-0"/>
                  <button onClick={()=>addToast("Reply drafted - copy to send via Gmail (preview)")} className="px-4 py-2 rounded-full bg-[#FF7A45] text-white text-[14px] font-medium inline-flex items-center gap-2 leading-6 shrink-0"><Send className="w-4 h-4"/>Reply</button>
                </div>
              </div>
            </div>
          )}

          {/* Meetings */}
          {activeView==="Meetings" && (
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="flex flex-col gap-6">
                <h1 className="text-xl font-semibold leading-6">Meeting Booking</h1>
                <div className="rounded-[20px] bg-white border p-6 flex flex-col gap-6">
                  <div><label className="text-[11px] uppercase tracking-wider font-medium opacity-60">Page title</label><input value={meetingTitle} onChange={e=>setMeetingTitle(e.target.value)} className="mt-2 w-full px-3 py-2.5 rounded-xl border bg-[#FFFBF7] text-[14px] leading-6"/></div>
                  <div className="grid grid-cols-2 gap-3"><div><label className="text-sm font-medium">Duration</label><select className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-white"><option>15 min</option><option>30 min</option><option>60 min</option></select></div><div><label className="text-sm font-medium">Availability</label><select className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-white"><option>Weekdays 9-5</option><option>Mon/Wed/Fri</option></select></div></div>
                  <label className="flex items-center gap-2 text-sm"><input type="checkbox" defaultChecked className="rounded"/> Round-robin to team</label>
                  <div className="p-3 rounded-xl bg-[#FFF6EF] border text-xs">Branding: warm neutral, logo, personal headshot. No Levitate branding on client view.</div>
                </div>
              </div>
              <div className="rounded-[20px] bg-white border p-5">
                <div className="text-sm font-medium opacity-60 uppercase tracking-widest">Public link preview</div>
                <div className="mt-3 rounded-2xl border overflow-hidden">
                  <div className="h-2 bg-gradient-to-r from-[#FF7A45] to-[#FFB347]"/>
                  <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-violet-300 mb-3"/>
                    <div className="font-bold text-lg">{meetingTitle}</div><div className="text-sm opacity-60 mt-1">Pick a time that works for you • 1:1 via Google Meet</div>
                    <div className="mt-5 grid grid-cols-7 gap-1 text-center text-xs">
                      {Array.from({length:14}).map((_,i)=><div key={i} className={`py-2 rounded-xl border ${i===3?"bg-[#2B211D] text-white":"bg-[#FFFBF7]"}`}>{10+i}</div>)}
                    </div>
                    <button onClick={()=>addToast("Booking link copied - ready to share")} className="mt-5 w-full py-2.5 rounded-full bg-[#2B211D] text-white text-sm font-medium inline-flex items-center justify-center gap-2"><Copy className="w-4 h-4"/>Copy link levitate.to/alex/review</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Surveys - tightened */}
          {activeView==="Surveys & Reviews" && (
            <div className="flex flex-col gap-8">
              <h1 className="text-xl font-semibold leading-6">Surveys & Reviews</h1>
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                  <h3 className="text-[15px] font-semibold flex items-center gap-2 leading-6"><Heart className="w-4 h-4 text-pink-500"/> Happiness Survey (NPS)</h3>
                  <div className="mt-4 p-4 rounded-xl bg-[#FFFBF7] border text-[14px] leading-6 max-w-[65ch]">How likely are you to recommend us? 0-10 • Follow-up: What could we do better?</div>
                  <div className="mt-4 flex gap-2 flex-wrap">{Array.from({length:11}).map((_,i)=><div key={i} className={`w-8 h-8 grid place-items-center rounded-full border text-[12px] font-medium leading-5 ${i===10?"bg-[#2B211D] text-white":"bg-white"}`}>{i}</div>)}</div>
                  <button onClick={()=>addToast("Survey link generated - 5-star flows to Google review")} className="mt-6 px-4 py-2 rounded-full bg-[#FF7A45] text-white text-[14px] leading-6">Generate review request</button>
                </div>
                <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                  <h3 className="text-[15px] font-semibold leading-6">Google Reviews inbox</h3>
                  <div className="mt-4 flex flex-col gap-3">
                    {[{n:"Grace L.", t:"Alex was amazing during our claim...", s:5},{n:"David K.", t:"Super helpful and personal touch", s:5}].map(r=>(
                      <div key={r.n} className="p-4 rounded-xl bg-[#FFFBF7] border"><div className="flex justify-between gap-3"><span className="font-medium text-[14px] leading-6">{r.n}</span><span className="text-amber-500 text-[14px]">{"★".repeat(r.s)}</span></div><div className="text-[14px] leading-6 mt-1 opacity-80 max-w-[65ch]">{r.t}</div><button onClick={()=>addToast("AI reply drafted: Thanks Grace! So happy we could help...")} className="mt-3 text-[12px] leading-5 px-3 py-1 rounded-full bg-white border">AI suggested reply</button></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reporting - kanban horizontal scroll snap, min-w 300, gap-5 pb-4 */}
          {activeView==="Reporting" && (
            <div className="flex flex-col gap-8">
              <h1 className="text-xl font-semibold leading-6">Reporting</h1>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6"><div className="text-[11px] uppercase tracking-wider opacity-60 font-semibold">Total sends (1:1)</div><div className="text-3xl font-bold mt-2 leading-none">{reportingSends}</div><div className="text-[12px] leading-5 opacity-60 mt-2 max-w-[65ch]">via Gmail/Outlook • looks personal</div></div>
                <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6"><div className="text-[11px] uppercase tracking-wider opacity-60 font-semibold">Avg open</div><div className="text-3xl font-bold mt-2 leading-none">64.2%</div><div className="mt-4 h-2 rounded-full bg-[#FFF1E8] overflow-hidden"><div className="h-full bg-[#FF7A45]" style={{width:"64%"}}/></div></div>
                <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6"><div className="text-[11px] uppercase tracking-wider opacity-60 font-semibold">Happiness trend</div><div className="mt-4 flex items-end gap-2 h-[48px]">{[3.8,4.1,4.3,4.2,4.6,4.9].map((v,i)=><div key={i} className="flex-1 bg-[#FFD1BF] rounded-t" style={{height:`${v*12}px`}}/>)}</div></div>
              </div>

              <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                <div className="flex justify-between items-center gap-4"><h3 className="text-[15px] font-semibold leading-6">Opportunity board • drag to move (session)</h3><span className="text-[12px] leading-5 opacity-60">{Object.values(kanban).flat().length} deals</span></div>
                <div className="mt-6 flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4">
                  {Object.entries(kanban).map(([col, ids])=>(
                    <div key={col} onDragOver={e=>e.preventDefault()} onDrop={e=>{
                      const cid = e.dataTransfer.getData("text/plain"); if(!cid) return;
                      setKanban(k=>{ const next:any={...k}; Object.keys(next).forEach(c=>{ next[c]=next[c].filter((id:string)=>id!==cid)}); next[col]=[...next[col], cid]; return next; });
                    }} className="rounded-2xl bg-[#FFFBF7] border p-4 min-h-[220px] min-w-[300px] snap-start shrink-0">
                      <div className="text-[11px] uppercase tracking-wider opacity-60 font-semibold">{col}</div>
                      <div className="mt-4 flex flex-col gap-3">
                        {ids.map(cid=>{
                          const c = contacts.find(x=>x.id===cid); if(!c) return null;
                          return <div key={cid} draggable onDragStart={e=>e.dataTransfer.setData("text/plain", cid)} className="rounded-xl bg-white border p-3 shadow-sm cursor-grab active:cursor-grabbing">
                            <div className="flex items-center gap-2"><GripVertical className="w-3 h-3 opacity-30"/><span className="font-medium text-[14px] leading-6 truncate">{c.firstName} {c.lastName}</span></div>
                            <div className="text-[12px] leading-5 opacity-60 mt-1 truncate">{c.company} • {c.tags[0]}</div>
                            <div className="mt-2 text-[11px] leading-4 px-2 py-1 rounded-full bg-[#FFF1E8] border w-fit">Keep: {c.keepInterval}d</div>
                          </div>
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                <h3 className="text-[15px] font-semibold leading-6">Automation funnel</h3>
                <div className="mt-4 flex items-center gap-3 text-[14px] leading-6 flex-wrap">
                  {["Enrolled 124","Sent 124","Opened 84 (68%)","Replied 18","Google review 6"].map((s,i)=>(
                    <React.Fragment key={s}><div className="px-3 py-2 rounded-full bg-[#FFFBF7] border whitespace-nowrap">{s}</div>{i<4 && <ChevronRight className="w-4 h-4 opacity-30 shrink-0"/>}</React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Settings - tightened typography */}
          {activeView==="Settings" && (
            <div className="flex flex-col gap-8 max-w-[960px]">
              <h1 className="text-xl font-semibold leading-6">Settings</h1>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6 flex flex-col gap-4">
                  <h3 className="text-[15px] font-semibold leading-6">Connected email</h3>
                  <div className="flex items-center justify-between p-3 rounded-xl border bg-[#FFFBF7] gap-3"><span className="text-[14px] leading-6 flex items-center gap-2 truncate"><Mail className="w-4 h-4 shrink-0"/>Gmail • alex@horizonins.com</span><span className="text-[11px] leading-4 px-2 py-1 rounded-full bg-[#E6F5EC] border shrink-0">Connected</span></div>
                  <div className="flex items-center justify-between p-3 rounded-xl border gap-3"><span className="text-[14px] leading-6 flex items-center gap-2"><Mail className="w-4 h-4"/>Outlook</span><button onClick={()=>addToast("Outlook connect flow opened (preview)")} className="text-[12px] leading-5 px-3 py-1 rounded-full bg-[#2B211D] text-white">Connect</button></div>
                  <div className="p-3 rounded-xl bg-[#FFF6EF] border text-[12px] leading-5 opacity-70 max-w-[65ch]">Emails send via your Gmail so they look 1:1 personal, avg 60%+ open, no bulk footer.</div>
                </div>
                <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                  <h3 className="text-[15px] font-semibold leading-6">Phone number</h3>
                  <div className="mt-4 p-3 rounded-xl border bg-[#FFFBF7] flex items-center justify-between gap-3"><span className="font-mono text-[14px] leading-6">(415) 555-0142</span><span className="text-[11px] leading-4 px-2 py-1 rounded-full bg-[#E8E6FF] border">Dedicated</span></div>
                  <button onClick={()=>addToast("Number provisioning mocked - ready for texting")} className="mt-4 w-full py-2.5 rounded-full bg-white border text-[14px] leading-6">Provision new number</button>
                </div>
              </div>
              <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                <h3 className="text-[15px] font-semibold leading-6">Integrations</h3>
                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {["QQ Catalyst","AMS360","Redtail","Wealthbox","AgencyZoom","Salesforce"].map(name=>(
                    <div key={name} className="p-4 rounded-2xl border bg-[#FFFBF7] flex flex-col gap-3"><div className="flex items-center gap-2"><Globe className="w-4 h-4"/><span className="font-medium text-[14px] leading-6">{name}</span></div><div className="text-[12px] leading-5 opacity-60 max-w-[65ch]">Sync contacts, activities, policies</div><button onClick={()=>addToast(`${name} connect opened (preview)`)} className="mt-auto py-2 rounded-full bg-white border text-[12px] font-medium leading-5">Connect</button></div>
                  ))}
                </div>
              </div>
              <div className="rounded-[20px] bg-white border border-[#F0E6DE] p-6">
                <h3 className="text-[15px] font-semibold leading-6">Team & Signature</h3>
                <div className="mt-4 flex flex-wrap gap-3">{owners.map(o=><span key={o} className="px-3 py-1.5 rounded-full bg-[#FFF1E8] border text-[14px] leading-6">{o}</span>)}</div>
                <div className="mt-4 p-3 rounded-xl border bg-[#FFFEFD] text-[14px] leading-6 font-mono max-w-[65ch]">Best,<br/>Alex • Horizon Insurance<br/>(415) 555-0100 • alex@horizonins.com</div>
              </div>
            </div>
          )}
          </div>
        </main>
      </div>

      {/* Contact Drawer - fixed inset-y-0 right-0 w-[420px] z-50, backdrop z-40 */}
      {selectedContact && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={()=>setSelectedContact(null)}/>
          <div className="fixed inset-y-0 right-0 w-[420px] max-w-[100vw] z-50 bg-white h-full shadow-2xl overflow-auto border-l">
            <div className="sticky top-0 bg-white/90 backdrop-blur p-5 border-b flex items-start justify-between">
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-2xl grid place-items-center text-white font-bold text-lg" style={{background:selectedContact.color}}>{selectedContact.firstName[0]}{selectedContact.lastName[0]}</div>
                <div><div className="font-bold text-[18px] leading-tight">{selectedContact.firstName} {selectedContact.lastName}</div><div className="text-sm opacity-60">{selectedContact.company}</div><div className="mt-1 flex gap-1 flex-wrap">{selectedContact.tags.map(t=><span key={t} className="text-[11px] px-2 py-0.5 rounded-full bg-[#FFF1E8] border">{t}</span>)}</div></div>
              </div>
              <button onClick={()=>setSelectedContact(null)} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5"/></button>
            </div>
            <div className="p-5 space-y-6">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="p-3 rounded-xl bg-[#FFFBF7] border"><div className="opacity-60 text-xs">Email</div><div className="font-medium truncate">{selectedContact.email}</div></div>
                <div className="p-3 rounded-xl bg-[#FFFBF7] border"><div className="opacity-60 text-xs">Phone</div><div className="font-medium">{selectedContact.phone}</div></div>
                <div className="p-3 rounded-xl bg-[#FFFBF7] border"><div className="opacity-60 text-xs">Owner</div><div className="font-medium">{selectedContact.owner}</div></div>
                <div className="p-3 rounded-xl bg-[#FFFBF7] border"><div className="opacity-60 text-xs">Connections</div><div className="font-medium">{selectedContact.connections} mutual</div></div>
              </div>

              <div>
                <div className="flex items-center justify-between"><h4 className="font-semibold text-sm flex items-center gap-2"><Repeat className="w-4 h-4"/>Keep in touch</h4><span className="text-xs opacity-60">Next due auto-calc</span></div>
                <div className="mt-2 flex gap-1.5 flex-wrap">
                  {[7,30,60,90].map(v=>(
                    <button key={v} onClick={()=>{updateContactKeep(selectedContact.id, v); setSelectedContact({...selectedContact, keepInterval:v});}} className={`px-3 py-1.5 rounded-full border text-xs font-medium ${selectedContact.keepInterval===v?"bg-[#2B211D] text-white":"bg-white hover:bg-[#FFF6EF]"}`}>{v===7?"Every 7 days":`Every ${v} days`}</button>
                  ))}
                </div>
                <div className="mt-2 text-xs opacity-60">Last contacted {selectedContact.lastContacted} • interval {selectedContact.keepInterval}d • next due {new Date(new Date(selectedContact.lastContacted).getTime()+selectedContact.keepInterval*86400000).toISOString().slice(0,10)}</div>
              </div>

              <div>
                <h4 className="font-semibold text-sm">Key Facts</h4>
                <div className="mt-2 space-y-2">
                  {selectedContact.keyFacts.map(kf=>(
                    <div key={kf.id} className="p-3 rounded-xl border bg-[#FFFEFD] flex justify-between gap-2"><div><div className="text-xs opacity-60">{kf.label}</div><div className="text-sm font-medium">{kf.value}</div></div><span className="text-[11px] px-2 py-1 rounded-full bg-[#FFF1E8] border h-fit">{kf.type}</span></div>
                  ))}
                  <button onClick={()=>addToast("Key Fact editor opened (session preview)")} className="w-full py-2 rounded-full bg-[#FFF6EF] border text-xs font-medium">+ Add Key Fact</button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm">Notes timeline</h4>
                <div className="mt-2 space-y-2">{selectedContact.notes.map(n=><div key={n.id} className="p-3 rounded-xl bg-[#FFFBF7] border text-sm"><div>{n.text}</div><div className="text-[11px] opacity-60 mt-1">{n.at} • {n.author}</div></div>)}
                <button onClick={()=>addToast("Note added to timeline (session)")} className="w-full py-2 rounded-full bg-white border text-xs">Add note</button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-sm">Action Items</h4>
                <div className="mt-2 space-y-2">
                  {selectedContact.actionItems.length===0 && <div className="text-xs opacity-60 p-3 rounded-xl bg-[#FFFBF7] border">No action items — use Plan to schedule follow-up (session)</div>}
                  {selectedContact.actionItems.map(a=>(
                    <div key={a.id} className="p-3 rounded-xl border flex gap-2"><div className="w-6 h-6 rounded-full bg-[#FFF1E8] grid place-items-center"><Clock className="w-3.5 h-3.5"/></div><div className="flex-1"><div className="text-sm font-medium">{a.title}</div><div className="text-xs opacity-60">Due {a.due} • {a.assignee}{a.isPrivate?" • private":""}</div></div></div>
                  ))}
                  <div className="flex gap-2"><button onClick={()=>addToast("Action item planned for this session")} className="flex-1 py-2 rounded-full bg-[#2B211D] text-white text-xs">Plan follow-up</button><button onClick={()=>addToast("Calendar sync preview ready")} className="flex-1 py-2 rounded-full bg-white border text-xs">Sync to calendar</button></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal - centered max-h-[90vh] overflow-auto, overlay z-40 modal z-50 */}
      {showAddContact && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={()=>setShowAddContact(false)}/>
          <form onSubmit={handleAddContact} className="relative z-50 w-full max-w-[440px] rounded-[24px] bg-white p-6 shadow-2xl border max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-start"><h3 className="text-lg font-bold">Add contact</h3><button type="button" onClick={()=>setShowAddContact(false)} className="p-1 rounded-full hover:bg-black/5"><X className="w-5 h-5"/></button></div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div><label className="text-xs font-medium">First name</label><input name="first" required className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-[#FFFBF7]"/></div>
              <div><label className="text-xs font-medium">Last name</label><input name="last" required className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-[#FFFBF7]"/></div>
              <div className="col-span-2"><label className="text-xs font-medium">Company</label><input name="company" className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-[#FFFBF7]" placeholder="Horizon Insurance"/></div>
            </div>
            <div className="mt-4 flex gap-2"><button type="submit" className="flex-1 py-2.5 rounded-full bg-[#2B211D] text-white text-sm font-medium">Create contact</button><button type="button" onClick={()=>setShowAddContact(false)} className="px-4 py-2.5 rounded-full bg-white border text-sm">Cancel</button></div>
            <div className="mt-3 text-[11px] opacity-60">Creates contact in this session. Dashboard counts update immediately. Export available as preview.</div>
          </form>
        </div>
      )}

      {/* Composer - modal max-h-[90vh] overflow-auto centered, z layers */}
      {composerOpen && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={()=>setComposerOpen(false)}/>
          <div className="relative z-50 mt-auto md:m-auto w-full md:max-w-[920px] bg-white md:rounded-[24px] rounded-t-[24px] shadow-2xl border overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4 md:p-5 border-b flex items-center justify-between gap-3">
              <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-[#FFF1E8] border grid place-items-center"><Mail className="w-4 h-4"/></div><div><div className="font-semibold">Compose personal email</div><div className="text-xs opacity-60">Sends as 1:1 via Gmail • no bulk footer • 60%+ open rate</div></div></div>
              <div className="flex items-center gap-2"><button onClick={()=>handleLevAction("rewrite")} className="hidden md:inline-flex px-3 py-1.5 rounded-full bg-[#FFF1E8] border text-xs font-medium gap-1 items-center"><Wand2 className="w-3.5 h-3.5"/>AI rewrite</button><button onClick={()=>setComposerOpen(false)} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5"/></button></div>
            </div>
            <div className="flex-1 overflow-auto grid md:grid-cols-[1.1fr_0.9fr]">
              <div className="p-4 md:p-5 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="text-xs font-medium">Template</label><select value={composerTemplate?.id || ""} onChange={e=>{const t=templates.find(x=>x.id===e.target.value); if(t){setComposerTemplate(t); setComposerSubject(t.subject); setComposerBody(t.body);}}} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-[#FFFBF7] text-sm">{templates.map(t=><option key={t.id} value={t.id}>{t.title}</option>)}</select></div>
                  <div><label className="text-xs font-medium">Recipients by tag</label><select value={composerRecipientsTag} onChange={e=>setComposerRecipientsTag(e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-white text-sm">{tagPool.map(t=><option key={t} value={t}>{t}</option>)}</select></div>
                </div>
                <div><label className="text-xs font-medium">Subject • supports {`{{firstName}} {{company}} {{keyFact}}`}</label><input value={composerSubject} onChange={e=>setComposerSubject(e.target.value)} placeholder={composerTemplate?.subject} className="mt-1 w-full px-3 py-2.5 rounded-xl border bg-white text-sm"/></div>
                <div><label className="text-xs font-medium">Body</label><textarea value={composerBody} onChange={e=>setComposerBody(e.target.value)} rows={10} className="mt-1 w-full px-3 py-3 rounded-xl border bg-white text-sm leading-relaxed" placeholder={composerTemplate?.body}/></div>
                <div className="flex flex-wrap gap-2 text-[11px]"><span className="px-2 py-1 rounded-full bg-[#FFF1E8] border">{"{{firstName}}"}</span><span className="px-2 py-1 rounded-full bg-[#FFF1E8] border">{"{{company}}"}</span><span className="px-2 py-1 rounded-full bg-[#FFF1E8] border">{"{{keyFact}}"}</span><span className="px-2 py-1 rounded-full bg-[#FFF1E8] border">{"{{renewalDate}}"}</span></div>
              </div>
              <div className="bg-[#FFFBF7] border-t md:border-t-0 md:border-l p-4 md:p-5">
                <div className="text-xs font-semibold uppercase tracking-widest opacity-60">Preview • personal inbox</div>
                <div className="mt-3 rounded-2xl bg-white border shadow-sm overflow-hidden">
                  <div className="p-3 border-b flex items-center gap-2 text-xs"><div className="w-6 h-6 rounded-full bg-[#FFD1BF]"/> <span className="font-medium">Alex • via Gmail</span><span className="opacity-50">to {composerRecipientsTag} • {contacts.filter(c=>c.tags.includes(composerRecipientsTag)).length} contacts</span></div>
                  <div className="p-4"><div className="font-semibold text-sm">{composerSubject || composerTemplate?.subject || "Subject"}</div><div className="mt-3 text-sm whitespace-pre-wrap leading-relaxed opacity-80">{composerBody || composerTemplate?.body || "Body preview..."}</div><div className="mt-6 text-[11px] opacity-50">No unsubscribe footer - this is a 1:1 personal email sent through your connected Gmail.</div></div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <button onClick={()=>{setComposerBody(b=> b + "\n\nP.S. Loved your note about {{keyFact}}!"); addToast("Personalized with Key Fact token");}} className="py-2 rounded-full bg-white border text-xs font-medium">Insert Key Fact</button>
                  <button onClick={()=>handleLevAction("rewrite")} className="py-2 rounded-full bg-[#2B211D] text-white text-xs font-medium inline-flex items-center justify-center gap-1"><Sparkles className="w-3.5 h-3.5"/>Rewrite warm</button>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={handleSend} className="flex-1 py-2.5 rounded-full bg-[#FF7A45] text-white text-sm font-semibold inline-flex items-center justify-center gap-2"><Send className="w-4 h-4"/>Send now • 1:1</button>
                  <button onClick={()=>{addToast("Scheduled for tomorrow 9am (session preview)"); setComposerOpen(false);}} className="px-4 py-2.5 rounded-full bg-white border text-sm">Schedule</button>
                </div>
                <div className="mt-3 text-[11px] opacity-60">Sending updates lastContacted, clears keep-in-touch overdue, adds to Reporting and Inbox threads.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lev Panel */}
      {showLev && (
        <div className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-50 md:w-[380px] flex flex-col">
          <div className="md:hidden absolute inset-0 bg-black/20" onClick={()=>setShowLev(false)}/>
          <div className="relative mt-auto md:mt-0 w-full bg-white md:rounded-[20px] rounded-t-[20px] shadow-2xl border overflow-hidden flex flex-col max-h-[84vh]">
            <div className="p-4 border-b flex items-center justify-between bg-gradient-to-br from-[#FFF6EF] to-[#FFEBD9]">
              <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-xl bg-[#2B211D] text-white grid place-items-center font-bold">L</div><div><div className="font-semibold text-sm">Lev 🦁</div><div className="text-[11px] opacity-60">Keep-in-touch copilot</div></div></div>
              <button onClick={()=>setShowLev(false)} className="p-1.5 rounded-full hover:bg-black/5"><X className="w-4 h-4"/></button>
            </div>
            <div className="p-3 flex gap-1.5 flex-wrap border-b bg-[#FFFBF7]">
              <button onClick={()=>handleLevAction("suggest")} className="px-2.5 py-1 rounded-full bg-white border text-[11px] font-medium">Who to contact?</button>
              <button onClick={()=>handleLevAction("rewrite")} className="px-2.5 py-1 rounded-full bg-white border text-[11px]">Rewrite friendly</button>
              <button onClick={()=>handleLevAction("translate")} className="px-2.5 py-1 rounded-full bg-white border text-[11px] flex items-center gap-1"><Languages className="w-3 h-3"/>Translate</button>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="whitespace-pre-wrap text-sm leading-relaxed p-3 rounded-2xl bg-[#FFF6EF] border">{levOutput}</div>
              <div className="mt-3 text-[11px] opacity-60">Lev surfaces insights from tags, key facts, birthdays, and no-contact gaps. No data leaves this preview - all mock generation.</div>
            </div>
            <div className="p-3 border-t flex gap-2 bg-white">
              <input value={levInput} onChange={e=>setLevInput(e.target.value)} placeholder="Ask Lev to draft: 'market update for VIPs'" className="flex-1 px-3 py-2.5 rounded-full bg-[#FFF6EF] border text-sm outline-none"/>
              <button onClick={()=>handleLevAction("generate")} className="px-4 py-2 rounded-full bg-[#2B211D] text-white text-sm font-medium">Generate</button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 z-[60] space-y-2 pointer-events-none">
        {toasts.map((t,i)=>(
          <div key={i} className="pointer-events-auto px-4 py-2.5 rounded-full bg-[#2B211D] text-white text-sm shadow-xl border border-white/10 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#FFB38A]"/><span>{t}</span>
          </div>
        ))}
      </div>

      {/* Small preview modal */}
      {showCampaignCalendar && composerTemplate && (
        <div className="fixed inset-0 z-40 grid place-items-center p-4">
          <div className="absolute inset-0 bg-black/20" onClick={()=>setShowCampaignCalendar(false)}/>
          <div className="relative bg-white rounded-[20px] p-5 max-w-[420px] w-full border shadow-xl">
            <div className="flex justify-between"><h3 className="font-semibold">{composerTemplate.title}</h3><button onClick={()=>setShowCampaignCalendar(false)}><X className="w-4 h-4"/></button></div>
            <div className="mt-3 text-sm opacity-80">{composerTemplate.social}</div>
            <div className={`mt-4 h-28 rounded-xl bg-gradient-to-br ${composerTemplate.gradient} grid place-items-center text-3xl`}>{composerTemplate.icon}</div>
            <button onClick={()=>{setShowCampaignCalendar(false); setComposerOpen(true);}} className="mt-4 w-full py-2 rounded-full bg-[#2B211D] text-white text-sm">Use this template</button>
          </div>
        </div>
      )}
    </div>
  );
}
