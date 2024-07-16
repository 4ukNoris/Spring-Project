package bg.softuni.mycinematicketsapp.web;

import bg.softuni.mycinematicketsapp.models.entities.UserEntity;
import bg.softuni.mycinematicketsapp.repository.UserRepository;
import com.icegreen.greenmail.util.GreenMail;
import com.icegreen.greenmail.util.ServerSetup;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import java.util.Optional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.redirectedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

//@SpringBootTest
//@AutoConfigureMockMvc
//class UserRegisterControllerTest {
//
//    @Autowired
//    private UserRepository userRepository;
//
//    @Autowired
//    private PasswordEncoder passwordEncoder;
//
//    @Autowired
//    private MockMvc mockMvc;
//
//    @Value("${mail.port}")
//    private int port;
//
//    @Value("${mail.host}")
//    private String host;
//
//    @Value("${mail.username}")
//    private String username;
//
//    @Value("${mail.password}")
//    private String password;
//    private GreenMail greenMail;
//
//    @BeforeEach
//    void setUp() {
//        this.greenMail = new GreenMail(new ServerSetup(port, host, "smtp"));
//        this.greenMail.start();
//        this.greenMail.setUser(username, password);
//    }
//
//    @AfterEach
//    void tearDown() {
//        this.greenMail.stop();
//    }
//
//    @Test
//    void testRegistration() throws Exception {
//        this.mockMvc.perform(
//                        MockMvcRequestBuilders.post("/users/register")
//                                .param("username", "admin")
//                                .param("name", "Admin Adminov")
//                                .param("email", "admin@gmail.com")
//                                .param("password", "123456789")
//                                .with(csrf())
//                ).andExpect(status().is3xxRedirection()).
//                andExpect(redirectedUrl("/users/login"));
//
//
//        Optional<UserEntity> optUser = this.userRepository.findByEmail("admin@gmail.com");
//
//        Assertions.assertTrue(optUser.isPresent());
//
//        UserEntity user = optUser.get();
//
//        Assertions.assertEquals("Admin Adminov", user.getName());
//        Assertions.assertTrue(passwordEncoder.matches("123456789", user.getPassword()));
//
//        this.greenMail.waitForIncomingEmail(1);
//        MimeMessage[] receivedMessages = this.greenMail.getReceivedMessages();
//
//        Assertions.assertEquals(1, receivedMessages.length);
//        MimeMessage registrationMessages = receivedMessages[0];
//
//        Assertions.assertTrue(registrationMessages.getContent().toString().contains("Admin"));
//        Assertions.assertEquals(1, registrationMessages.getAllRecipients().length);
//        Assertions.assertEquals("admin@gmail.com", registrationMessages.getAllRecipients()[0].toString());
//
//    }
//
//}