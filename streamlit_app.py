import streamlit as st

from personality_blender import BlendConfig, PersonalityBlender


st.set_page_config(page_title="Personality Blender", page_icon="🧪", layout="centered")
st.title("🧪 Personality Blender")
st.caption("Mash two personas into one consistent character voice.")

if "blender" not in st.session_state:
    st.session_state.blender = None
if "chat" not in st.session_state:
    st.session_state.chat = []
if "last_error" not in st.session_state:
    st.session_state.last_error = ""

with st.sidebar:
    st.header("Blend Setup")
    persona_a = st.text_input("Persona A", value="Sherlock Holmes")
    persona_b = st.text_input("Persona B", value="Gordon Ramsay")
    response_goal = st.text_input("Response Goal (optional)", value="Concise and witty")
    consistency_mode = st.checkbox("Strict consistency mode", value=True)

    start_clicked = st.button("Start / Reset Blend", type="primary", use_container_width=True)

if start_clicked:
    try:
        config = BlendConfig(
            persona_a=persona_a.strip(),
            persona_b=persona_b.strip(),
            response_goal=response_goal.strip(),
            consistency_mode=consistency_mode,
        )

        if not config.persona_a or not config.persona_b:
            st.session_state.last_error = "Persona A and Persona B are required."
        else:
            model = None
            try:
                import os

                model = os.getenv("MODEL", "gpt-4o-mini")
            except Exception:
                model = "gpt-4o-mini"

            blender = PersonalityBlender(model=model)
            blender.start_session(config)
            st.session_state.blender = blender
            st.session_state.chat = []
            st.session_state.last_error = ""
    except Exception as error:
        st.session_state.last_error = str(error)

if st.session_state.last_error:
    st.error(st.session_state.last_error)

for role, text in st.session_state.chat:
    with st.chat_message(role):
        st.markdown(text)

question = st.chat_input("Ask your blended character anything...")

if question:
    st.session_state.chat.append(("user", question))
    with st.chat_message("user"):
        st.markdown(question)

    blender = st.session_state.blender
    if blender is None:
        warning = "Start the blend first using the sidebar."
        st.session_state.chat.append(("assistant", warning))
        with st.chat_message("assistant"):
            st.markdown(warning)
    else:
        with st.chat_message("assistant"):
            with st.spinner("Blending personalities..."):
                try:
                    answer = blender.ask(question)
                    st.markdown(answer)
                    st.session_state.chat.append(("assistant", answer))
                except Exception as error:
                    message = f"Error while generating response: {error}"
                    st.markdown(message)
                    st.session_state.chat.append(("assistant", message))
